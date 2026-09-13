import datetime
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Occupancy, Booking, Room, Hotel

def get_or_calculate_occupancy(db: Session, hotel_id: int, room_type: str, date: datetime.date) -> Occupancy:
    """
    Computes real-time occupancy for a given hotel, room type, and date.
    Syncs with the Occupancy table.
    """
    # Total rooms of this type
    total_rooms = db.query(Room).filter(
        Room.hotel_id == hotel_id,
        Room.room_type == room_type
    ).count()

    if total_rooms == 0:
        total_rooms = 1 # avoid division by zero

    # Active bookings on that date
    occupied_count = db.query(Booking).join(Room).filter(
        Booking.hotel_id == hotel_id,
        Room.room_type == room_type,
        Booking.status == "Confirmed",
        Booking.cancellation_status == False,
        Booking.check_in <= date,
        Booking.check_out > date
    ).count()

    available_rooms = max(0, total_rooms - occupied_count)
    occupancy_rate = round((occupied_count / total_rooms) * 100.0, 1)

    record = db.query(Occupancy).filter(
        Occupancy.hotel_id == hotel_id,
        Occupancy.room_type == room_type,
        Occupancy.date == date
    ).first()

    if not record:
        record = Occupancy(
            hotel_id=hotel_id,
            room_type=room_type,
            date=date,
            total_rooms=total_rooms,
            occupied_rooms=occupied_count,
            available_rooms=available_rooms,
            occupancy_rate=occupancy_rate
        )
        db.add(record)
    else:
        record.total_rooms = total_rooms
        record.occupied_rooms = occupied_count
        record.available_rooms = available_rooms
        record.occupancy_rate = occupancy_rate

    db.commit()
    db.refresh(record)
    return record

def update_occupancy_for_booking_range(db: Session, hotel_id: int, room_type: str, start_date: datetime.date, end_date: datetime.date):
    """
    Updates occupancy records for each day in a booking's date span.
    """
    curr = start_date
    while curr < end_date:
        get_or_calculate_occupancy(db, hotel_id, room_type, curr)
        curr += datetime.timedelta(days=1)

def get_hotel_overall_occupancy(db: Session, hotel_id: int, date: datetime.date) -> Dict[str, float]:
    """
    Computes overall hotel occupancy across all room types on a given date.
    """
    total_rooms = db.query(Room).filter(Room.hotel_id == hotel_id).count()
    if total_rooms == 0:
        return {"total_rooms": 0, "occupied_rooms": 0, "available_rooms": 0, "occupancy_rate": 0.0}

    occupied_count = db.query(Booking).filter(
        Booking.hotel_id == hotel_id,
        Booking.status == "Confirmed",
        Booking.cancellation_status == False,
        Booking.check_in <= date,
        Booking.check_out > date
    ).count()

    available_rooms = max(0, total_rooms - occupied_count)
    rate = round((occupied_count / total_rooms) * 100.0, 1)

    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_count,
        "available_rooms": available_rooms,
        "occupancy_rate": rate
    }
