from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Hotel
from app.analytics.analytics_service import (
    get_dashboard_kpis, get_revenue_comparison,
    get_occupancy_and_price_trends, get_room_type_breakdown
)

router = APIRouter(prefix="/analytics", tags=["Analytics & BI"])

def _get_default_hotel_id(db: Session, hotel_id: Optional[int]) -> int:
    if hotel_id:
        return hotel_id
    hotel = db.query(Hotel).first()
    return hotel.id if hotel else 1

@router.get("/kpis")
def get_kpis(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    h_id = _get_default_hotel_id(db, hotel_id)
    return get_dashboard_kpis(db, h_id)

@router.get("/fixed-vs-dynamic")
def get_fixed_vs_dynamic(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    h_id = _get_default_hotel_id(db, hotel_id)
    return get_revenue_comparison(db, h_id)

@router.get("/trends")
def get_trends(hotel_id: Optional[int] = None, days: int = 30, db: Session = Depends(get_db)):
    h_id = _get_default_hotel_id(db, hotel_id)
    return get_occupancy_and_price_trends(db, h_id, days=days)

@router.get("/room-types")
def get_room_types(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    h_id = _get_default_hotel_id(db, hotel_id)
    return get_room_type_breakdown(db, h_id)
