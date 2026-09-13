import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import (
    Room, Hotel, PricingRecommendation, PriceHistory, PricingRule
)
from app.schemas.schemas import (
    PricingRecommendationResponse, RecommendationActionRequest,
    PriceHistoryResponse, PricingRuleResponse, PricingRuleUpdate,
    PriceSimulationRequest, PriceSimulationResponse
)
from app.services.recommendation_service import (
    generate_recommendation_for_room, approve_recommendation,
    reject_recommendation, recalculate_hotel_pricing
)
from app.pricing.pricing_engine import calculate_room_pricing
from app.api.deps import get_current_user

router = APIRouter(prefix="/pricing", tags=["Pricing Engine"])

# ----------------- Recommendations -----------------
@router.get("/recommendations", response_model=List[PricingRecommendationResponse])
def list_recommendations(
    hotel_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PricingRecommendation).join(Room)
    if hotel_id:
        query = query.filter(Room.hotel_id == hotel_id)
    if status:
        query = query.filter(PricingRecommendation.status == status)

    recs = query.order_by(PricingRecommendation.created_at.desc()).limit(100).all()
    results = []
    for r in recs:
        room = r.room
        results.append(PricingRecommendationResponse(
            id=r.id,
            room_id=r.room_id,
            room_number=room.room_number if room else "N/A",
            room_type=room.room_type if room else "Standard",
            date=r.date,
            base_price=r.base_price,
            current_price=room.current_price if room else r.base_price,
            demand_multiplier=r.demand_multiplier,
            occupancy_multiplier=r.occupancy_multiplier,
            weekend_multiplier=r.weekend_multiplier,
            festival_multiplier=r.festival_multiplier,
            weather_multiplier=r.weather_multiplier,
            event_multiplier=r.event_multiplier,
            lead_time_multiplier=r.lead_time_multiplier,
            competitor_multiplier=r.competitor_multiplier,
            final_recommended_price=r.final_recommended_price,
            explanation=r.explanation,
            status=r.status,
            created_at=r.created_at
        ))
    return results

@router.post("/recommendations/{id}/approve")
def approve_rec_endpoint(
    id: int,
    action_in: Optional[RecommendationActionRequest] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        user_name = current_user.name if current_user else "Hotel Admin"
        custom_price = action_in.custom_price if action_in else None
        rec = approve_recommendation(db, id, custom_price=custom_price, user_name=user_name)
        return {
            "message": "Pricing recommendation approved and room price updated successfully.",
            "recommendation_id": rec.id,
            "room_id": rec.room_id,
            "new_price": rec.room.current_price,
            "status": rec.status
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/recommendations/{id}/reject")
def reject_rec_endpoint(id: int, db: Session = Depends(get_db)):
    try:
        rec = reject_recommendation(db, id)
        return {"message": "Recommendation rejected.", "status": rec.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/recommendations/{id}/apply")
def apply_rec_endpoint(
    id: int,
    action_in: RecommendationActionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_name = current_user.name if current_user else "Hotel Admin"
    rec = approve_recommendation(db, id, custom_price=action_in.custom_price, user_name=user_name)
    return {
        "message": "Custom price applied successfully.",
        "room_id": rec.room_id,
        "new_price": rec.room.current_price
    }

@router.post("/recalculate-all")
def trigger_recalculate_all(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1
    
    recalculate_hotel_pricing(db, hotel_id)
    return {"message": "Dynamic pricing recalculation triggered for all rooms."}

# ----------------- Price History -----------------
@router.get("/history", response_model=List[PriceHistoryResponse])
def get_price_history(room_id: Optional[int] = None, hotel_id: Optional[int] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(PriceHistory).join(Room)
    if room_id:
        query = query.filter(PriceHistory.room_id == room_id)
    if hotel_id:
        query = query.filter(Room.hotel_id == hotel_id)
    
    histories = query.order_by(PriceHistory.changed_at.desc()).limit(limit).all()
    results = []
    for h in histories:
        r = h.room
        results.append(PriceHistoryResponse(
            id=h.id,
            room_id=h.room_id,
            room_number=r.room_number if r else "N/A",
            room_type=r.room_type if r else "Standard",
            old_price=h.old_price,
            new_price=h.new_price,
            reason=h.reason,
            changed_by=h.changed_by,
            changed_at=h.changed_at
        ))
    return results

# ----------------- Pricing Rules Configuration -----------------
@router.get("/rules", response_model=PricingRuleResponse)
def get_pricing_rules(hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1

    rule = db.query(PricingRule).filter(PricingRule.hotel_id == hotel_id).first()
    if not rule:
        rule = PricingRule(hotel_id=hotel_id)
        db.add(rule)
        db.commit()
        db.refresh(rule)
    return rule

@router.put("/rules", response_model=PricingRuleResponse)
def update_pricing_rules(rule_in: PricingRuleUpdate, hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1

    rule = db.query(PricingRule).filter(PricingRule.hotel_id == hotel_id).first()
    if not rule:
        rule = PricingRule(hotel_id=hotel_id)
        db.add(rule)

    data = rule_in.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(rule, key, val)

    # Sync hotel auto_pricing_enabled
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if hotel and "auto_pricing_enabled" in data:
        hotel.auto_pricing_enabled = data["auto_pricing_enabled"]

    db.commit()
    db.refresh(rule)
    return rule

# ----------------- Interactive Price Simulator -----------------
@router.post("/simulate", response_model=PriceSimulationResponse)
def simulate_pricing(sim_in: PriceSimulationRequest, hotel_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Real-time interactive pricing simulator.
    Immediately calculates demand score, level, adjustments, and final price.
    """
    rules = None
    if hotel_id:
        rules = db.query(PricingRule).filter(PricingRule.hotel_id == hotel_id).first()
    else:
        rules = db.query(PricingRule).first()

    dow = sim_in.day_of_week or ("Saturday" if sim_in.is_weekend else "Wednesday")

    result = calculate_room_pricing(
        base_price=sim_in.base_price,
        current_price=sim_in.current_price or sim_in.base_price,
        occupancy_rate=sim_in.occupancy_rate,
        day_of_week=dow,
        festival_importance=sim_in.festival_type,
        festival_name=sim_in.festival_name,
        event_importance=sim_in.event_type,
        event_name=sim_in.event_name,
        weather_condition=sim_in.weather_condition,
        lead_time_days=sim_in.lead_time_days,
        rooms_available_pct=sim_in.rooms_available_pct,
        competitor_price=sim_in.competitor_price,
        rules=rules,
        enforce_daily_cap=sim_in.enforce_daily_cap
    )

    return PriceSimulationResponse(**result)
