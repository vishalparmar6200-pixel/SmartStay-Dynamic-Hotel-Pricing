import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.models import Booking, Room, User, Hotel
from app.schemas.schemas import BookingCreate
from app.services.occupancy_service import update_occupancy_for_booking_range
from app.services.recommendation_service import recalculate_hotel_pricing

def create_booking(db: Session, booking_in: BookingCreate, current_user: Optional[User] = None) -> Booking:
    """
    Simulates booking creation, updates occupancy, and fires real-time pricing recalculations.
    """
    room = db.query(Room).filter(Room.id == booking_in.room_id).first()
    if not room:
        raise ValueError("Selected room does not exist")

    if booking_in.check_out <= booking_in.check_in:
        raise ValueError("Check-out date must be after check-in date")

    # Conflict check
    conflict = db.query(Booking).filter(
        Booking.room_id == room.id,
        Booking.status == "Confirmed",
        Booking.cancellation_status == False,
        Booking.check_in < booking_in.check_out,
        Booking.check_out > booking_in.check_in
    ).first()

    if conflict:
        raise ValueError(f"Room {room.room_number} is already booked from {conflict.check_in} to {conflict.check_out}")

    # Determine customer id
    customer_id = None
    if current_user:
        customer_id = current_user.id
    elif booking_in.customer_id:
        customer_id = booking_in.customer_id
    else:
        # Create or find a guest user
        email = booking_in.customer_email or "guest@smartstay.com"
        guest = db.query(User).filter(User.email == email).first()
        if not guest:
            guest = User(
                name=booking_in.customer_name or "Valued Guest",
                email=email,
                password_hash="simulated_guest_hash",
                role="CUSTOMER"
            )
            db.add(guest)
            db.commit()
            db.refresh(guest)
        customer_id = guest.id

    nights = max(1, (booking_in.check_out - booking_in.check_in).days)
    total_price = round(room.current_price * nights, 2)

    booking = Booking(
        hotel_id=room.hotel_id,
        room_id=room.id,
        customer_id=customer_id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
        booking_date=datetime.date.today(),
        number_of_guests=booking_in.number_of_guests,
        price_paid=total_price,
        status="Confirmed",
        cancellation_status=False
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # If booking is active today, mark room as occupied
    today = datetime.date.today()
    if booking.check_in <= today < booking.check_out:
        room.status = "Occupied"
        db.commit()

    # Real-time synchronization of Occupancy
    update_occupancy_for_booking_range(db, room.hotel_id, room.room_type, booking.check_in, booking.check_out)

    # Trigger Dynamic Pricing Engine recalculation for check-in date
    try:
        recalculate_hotel_pricing(db, room.hotel_id, target_date=booking.check_in)
    except Exception:
        pass # Non-blocking

    return booking

def cancel_booking(db: Session, booking_id: int) -> Booking:
    """
    Cancels booking, releases inventory, updates occupancy, and triggers repricing.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found")

    booking.status = "Cancelled"
    booking.cancellation_status = True
    
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.status = "Available"

    db.commit()

    # Recalculate occupancy
    if room:
        update_occupancy_for_booking_range(db, room.hotel_id, room.room_type, booking.check_in, booking.check_out)
        try:
            recalculate_hotel_pricing(db, room.hotel_id, target_date=booking.check_in)
        except Exception:
            pass

    db.refresh(booking)
    return booking
