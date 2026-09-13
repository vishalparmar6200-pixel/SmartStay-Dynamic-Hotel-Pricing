import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Occupancy, Hotel
from app.schemas.schemas import OccupancyResponse
from app.services.occupancy_service import get_hotel_overall_occupancy, get_or_calculate_occupancy

router = APIRouter(prefix="/occupancy", tags=["Occupancy"])

@router.get("", response_model=List[OccupancyResponse])
def list_occupancy(
    hotel_id: Optional[int] = None,
    room_type: Optional[str] = None,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Occupancy)
    if hotel_id:
        query = query.filter(Occupancy.hotel_id == hotel_id)
    if room_type:
        query = query.filter(Occupancy.room_type == room_type)
    if start_date:
        query = query.filter(Occupancy.date >= start_date)
    if end_date:
        query = query.filter(Occupancy.date <= end_date)
    
    return query.order_by(Occupancy.date.desc(), Occupancy.room_type).limit(100).all()

@router.get("/{date}")
def get_occupancy_by_date(date: datetime.date, hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1

    room_types = ["Standard", "Deluxe", "Premium", "Suite"]
    by_type = []
    for rt in room_types:
        occ = get_or_calculate_occupancy(db, hotel_id, rt, date)
        by_type.append({
            "room_type": rt,
            "total_rooms": occ.total_rooms,
            "occupied_rooms": occ.occupied_rooms,
            "available_rooms": occ.available_rooms,
            "occupancy_rate": occ.occupancy_rate
        })

    overall = get_hotel_overall_occupancy(db, hotel_id, date)
    return {
        "date": date,
        "hotel_id": hotel_id,
        "overall": overall,
        "room_types": by_type
    }
