import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import DemandScore, Hotel, PricingRule
from app.schemas.schemas import DemandScoreResponse
from app.pricing.demand_engine import calculate_demand_score

router = APIRouter(prefix="/demand", tags=["Demand Analytics"])

@router.get("/calculate")
def calculate_demand(
    occupancy_rate: float = Query(75.0, ge=0.0, le=100.0),
    recent_bookings_7d: int = Query(12, ge=0),
    day_of_week: str = Query("Saturday"),
    festival_importance: str = Query("None"),
    event_importance: str = Query("None"),
    weather_condition: str = Query("Good"),
    month: int = Query(10, ge=1, le=12),
    hotel_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    rules = None
    if hotel_id:
        rules = db.query(PricingRule).filter(PricingRule.hotel_id == hotel_id).first()
    
    score, level, breakdown = calculate_demand_score(
        occupancy_rate=occupancy_rate,
        recent_bookings_7d=recent_bookings_7d,
        day_of_week=day_of_week,
        festival_importance=festival_importance,
        event_importance=event_importance,
        month=month,
        weather_condition=weather_condition,
        rules=rules
    )

    return {
        "demand_score": score,
        "demand_level": level,
        "breakdown": breakdown,
        "parameters": {
            "occupancy_rate": occupancy_rate,
            "recent_bookings_7d": recent_bookings_7d,
            "day_of_week": day_of_week,
            "festival_importance": festival_importance,
            "event_importance": event_importance,
            "weather_condition": weather_condition,
            "month": month
        }
    }

@router.get("/today")
def get_today_demand(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1

    today = datetime.date.today()
    scores = db.query(DemandScore).filter(
        DemandScore.hotel_id == hotel_id,
        DemandScore.date == today
    ).all()

    if not scores:
        # Generate default score for Deluxe room
        rules = db.query(PricingRule).filter(PricingRule.hotel_id == hotel_id).first()
        score, level, breakdown = calculate_demand_score(
            occupancy_rate=82.0,
            recent_bookings_7d=16,
            day_of_week=today.strftime("%A"),
            festival_importance="Major",
            event_importance="High",
            weather_condition="Good",
            month=today.month,
            rules=rules
        )
        return [{
            "hotel_id": hotel_id,
            "room_type": "Deluxe",
            "date": today,
            "total_demand_score": score,
            "demand_level": level,
            "breakdown": breakdown
        }]

    return [{
        "hotel_id": s.hotel_id,
        "room_type": s.room_type,
        "date": s.date,
        "total_demand_score": s.total_demand_score,
        "demand_level": s.demand_level,
        "breakdown": {
            "occupancy": s.occupancy_score,
            "recent_bookings": s.booking_score,
            "weekend": s.weekend_score,
            "festival": s.festival_score,
            "event": s.event_score,
            "weather": s.weather_score,
            "season": s.season_score
        }
    } for s in scores]

@router.get("/history", response_model=List[DemandScoreResponse])
def get_demand_history(hotel_id: Optional[int] = None, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(DemandScore)
    if hotel_id:
        query = query.filter(DemandScore.hotel_id == hotel_id)
    return query.order_by(DemandScore.date.desc()).limit(limit).all()
