from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Booking, Room, User
from app.schemas.schemas import BookingCreate, BookingResponse
from app.services.booking_service import create_booking, cancel_booking
from app.api.deps import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("", response_model=List[BookingResponse])
def list_bookings(
    hotel_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if hotel_id:
        query = query.filter(Booking.hotel_id == hotel_id)
    if customer_id:
        query = query.filter(Booking.customer_id == customer_id)
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    # Populate extra fields for response
    results = []
    for b in bookings:
        r = b.room
        c = b.customer
        item = BookingResponse(
            id=b.id,
            hotel_id=b.hotel_id,
            room_id=b.room_id,
            customer_id=b.customer_id,
            check_in=b.check_in,
            check_out=b.check_out,
            booking_date=b.booking_date,
            number_of_guests=b.number_of_guests,
            price_paid=b.price_paid,
            status=b.status,
            cancellation_status=b.cancellation_status,
            created_at=b.created_at,
            room_number=r.room_number if r else "N/A",
            room_type=r.room_type if r else "Standard",
            customer_name=c.name if c else "Guest"
        )
        results.append(item)
    return results

@router.get("/{id}", response_model=BookingResponse)
def get_booking(id: int, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    r = b.room
    c = b.customer
    return BookingResponse(
        id=b.id,
        hotel_id=b.hotel_id,
        room_id=b.room_id,
        customer_id=b.customer_id,
        check_in=b.check_in,
        check_out=b.check_out,
        booking_date=b.booking_date,
        number_of_guests=b.number_of_guests,
        price_paid=b.price_paid,
        status=b.status,
        cancellation_status=b.cancellation_status,
        created_at=b.created_at,
        room_number=r.room_number if r else "N/A",
        room_type=r.room_type if r else "Standard",
        customer_name=c.name if c else "Guest"
    )

@router.post("", response_model=BookingResponse)
def make_booking(booking_in: BookingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        booking = create_booking(db, booking_in, current_user=current_user)
        r = booking.room
        c = booking.customer
        return BookingResponse(
            id=booking.id,
            hotel_id=booking.hotel_id,
            room_id=booking.room_id,
            customer_id=booking.customer_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            booking_date=booking.booking_date,
            number_of_guests=booking.number_of_guests,
            price_paid=booking.price_paid,
            status=booking.status,
            cancellation_status=booking.cancellation_status,
            created_at=booking.created_at,
            room_number=r.room_number if r else "N/A",
            room_type=r.room_type if r else "Standard",
            customer_name=c.name if c else "Guest"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/cancel", response_model=BookingResponse)
def cancel_booking_endpoint(id: int, db: Session = Depends(get_db)):
    try:
        booking = cancel_booking(db, id)
        r = booking.room
        c = booking.customer
        return BookingResponse(
            id=booking.id,
            hotel_id=booking.hotel_id,
            room_id=booking.room_id,
            customer_id=booking.customer_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            booking_date=booking.booking_date,
            number_of_guests=booking.number_of_guests,
            price_paid=booking.price_paid,
            status=booking.status,
            cancellation_status=booking.cancellation_status,
            created_at=booking.created_at,
            room_number=r.room_number if r else "N/A",
            room_type=r.room_type if r else "Standard",
            customer_name=c.name if c else "Guest"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
