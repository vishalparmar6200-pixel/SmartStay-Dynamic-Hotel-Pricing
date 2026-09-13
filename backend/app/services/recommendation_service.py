import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import (
    Room, Hotel, PricingRule, PricingRecommendation,
    PriceHistory, DemandScore, CompetitorPrice, Booking
)
from app.services.occupancy_service import get_or_calculate_occupancy
from app.services.weather_service import get_or_create_weather
from app.services.event_service import get_event_and_festival_for_date
from app.pricing.pricing_engine import calculate_room_pricing

def generate_recommendation_for_room(
    db: Session,
    room_id: int,
    target_date: Optional[datetime.date] = None,
    enforce_daily_cap: bool = True
) -> PricingRecommendation:
    """
    Core pricing recommendation pipeline for a specific room and date.
    Gathers hotel context, runs rule engines, records recommendation,
    and applies automatically if auto-pricing is enabled.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise ValueError(f"Room with id {room_id} not found")

    hotel = db.query(Hotel).filter(Hotel.id == room.hotel_id).first()
    if not hotel:
        raise ValueError(f"Hotel with id {room.hotel_id} not found")

    rules = db.query(PricingRule).filter(PricingRule.hotel_id == hotel.id).first()

    today = datetime.date.today()
    if not target_date:
        target_date = today

    lead_time_days = max(0, (target_date - today).days)
    day_name = target_date.strftime("%A")
    month = target_date.month

    # 1. Occupancy & Available rooms
    occ_record = get_or_calculate_occupancy(db, hotel.id, room.room_type, target_date)
    occupancy_rate = occ_record.occupancy_rate
    rooms_avail_pct = round((occ_record.available_rooms / max(1, occ_record.total_rooms)) * 100.0, 1)

    # 2. Recent Bookings count (last 7 days)
    seven_days_ago = today - datetime.timedelta(days=7)
    recent_bookings = db.query(Booking).filter(
        Booking.hotel_id == hotel.id,
        Booking.booking_date >= seven_days_ago,
        Booking.status != "Cancelled"
    ).count()

    # 3. Weather
    weather = get_or_create_weather(db, hotel.city, target_date)

    # 4. Festival & Events
    festival, local_event = get_event_and_festival_for_date(db, target_date, hotel.city)

    # 5. Competitor average
    comp_records = db.query(CompetitorPrice).filter(
        CompetitorPrice.hotel_id == hotel.id,
        CompetitorPrice.room_type == room.room_type,
        CompetitorPrice.date == target_date
    ).all()
    avg_comp_price = (sum(c.competitor_price for c in comp_records) / len(comp_records)) if comp_records else None

    # 6. Execute Pricing Calculation Engine
    calc_result = calculate_room_pricing(
        base_price=room.base_price,
        current_price=room.current_price,
        occupancy_rate=occupancy_rate,
        day_of_week=day_name,
        festival_importance=festival.importance if festival else "None",
        festival_name=festival.name if festival else None,
        event_importance=local_event.importance if local_event else "None",
        event_name=local_event.name if local_event else None,
        weather_condition=weather.weather_condition,
        lead_time_days=lead_time_days,
        rooms_available_pct=rooms_avail_pct,
        competitor_price=avg_comp_price,
        month=month,
        recent_bookings_7d=recent_bookings,
        total_rooms=occ_record.total_rooms,
        rules=rules,
        enforce_daily_cap=enforce_daily_cap
    )

    # 7. Store / Update DemandScore audit log
    ds_record = db.query(DemandScore).filter(
        DemandScore.hotel_id == hotel.id,
        DemandScore.room_type == room.room_type,
        DemandScore.date == target_date
    ).first()

    bdown = calc_result["demand_breakdown"]
    if not ds_record:
        ds_record = DemandScore(
            hotel_id=hotel.id,
            room_type=room.room_type,
            date=target_date,
            occupancy_score=bdown.get("occupancy", 0.0),
            booking_score=bdown.get("recent_bookings", 0.0),
            weekend_score=bdown.get("weekend", 0.0),
            festival_score=bdown.get("festival", 0.0),
            event_score=bdown.get("event", 0.0),
            weather_score=bdown.get("weather", 0.0),
            season_score=bdown.get("season", 0.0),
            total_demand_score=calc_result["demand_score"],
            demand_level=calc_result["demand_level"]
        )
        db.add(ds_record)
    else:
        ds_record.occupancy_score = bdown.get("occupancy", 0.0)
        ds_record.booking_score = bdown.get("recent_bookings", 0.0)
        ds_record.weekend_score = bdown.get("weekend", 0.0)
        ds_record.festival_score = bdown.get("festival", 0.0)
        ds_record.event_score = bdown.get("event", 0.0)
        ds_record.weather_score = bdown.get("weather", 0.0)
        ds_record.season_score = bdown.get("season", 0.0)
        ds_record.total_demand_score = calc_result["demand_score"]
        ds_record.demand_level = calc_result["demand_level"]

    # Multipliers extraction
    adj_map = {item["factor"]: item["percentage"] for item in calc_result["adjustments"]}

    # 8. Create or update PricingRecommendation
    rec = db.query(PricingRecommendation).filter(
        PricingRecommendation.room_id == room.id,
        PricingRecommendation.date == target_date,
        PricingRecommendation.status.in_(["Pending"])
    ).first()

    auto_enabled = (rules.auto_pricing_enabled if rules else False) or hotel.auto_pricing_enabled

    initial_status = "Applied" if auto_enabled else "Pending"

    if not rec:
        rec = PricingRecommendation(
            room_id=room.id,
            date=target_date,
            base_price=room.base_price,
            demand_multiplier=calc_result["total_multiplier"],
            occupancy_multiplier=1.0 + (adj_map.get("Occupancy", 0.0) / 100.0),
            weekend_multiplier=1.0 + (adj_map.get("Weekend", 0.0) / 100.0),
            festival_multiplier=1.0 + (adj_map.get("Festival", 0.0) / 100.0),
            weather_multiplier=1.0 + (adj_map.get("Weather", 0.0) / 100.0),
            event_multiplier=1.0 + (adj_map.get("Local Event", 0.0) / 100.0),
            lead_time_multiplier=1.0 + (adj_map.get("Lead Time", 0.0) / 100.0),
            competitor_multiplier=1.0 + (adj_map.get("Competitor Benchmark", 0.0) / 100.0),
            final_recommended_price=calc_result["final_recommended_price"],
            explanation=calc_result["explanation"],
            status=initial_status
        )
        db.add(rec)
    else:
        rec.base_price = room.base_price
        rec.demand_multiplier = calc_result["total_multiplier"]
        rec.occupancy_multiplier = 1.0 + (adj_map.get("Occupancy", 0.0) / 100.0)
        rec.weekend_multiplier = 1.0 + (adj_map.get("Weekend", 0.0) / 100.0)
        rec.festival_multiplier = 1.0 + (adj_map.get("Festival", 0.0) / 100.0)
        rec.weather_multiplier = 1.0 + (adj_map.get("Weather", 0.0) / 100.0)
        rec.event_multiplier = 1.0 + (adj_map.get("Local Event", 0.0) / 100.0)
        rec.lead_time_multiplier = 1.0 + (adj_map.get("Lead Time", 0.0) / 100.0)
        rec.competitor_multiplier = 1.0 + (adj_map.get("Competitor Benchmark", 0.0) / 100.0)
        rec.final_recommended_price = calc_result["final_recommended_price"]
        rec.explanation = calc_result["explanation"]
        if auto_enabled:
            rec.status = "Applied"

    # If Auto-Pricing is enabled, update room price immediately and log audit
    if auto_enabled and room.current_price != calc_result["final_recommended_price"]:
        old_price = room.current_price
        new_price = calc_result["final_recommended_price"]
        room.current_price = new_price

        history = PriceHistory(
            room_id=room.id,
            old_price=old_price,
            new_price=new_price,
            reason=calc_result["explanation"],
            changed_by="Auto-Pricing Engine"
        )
        db.add(history)

    db.commit()
    db.refresh(rec)
    return rec

def approve_recommendation(db: Session, recommendation_id: int, custom_price: Optional[float] = None, user_name: str = "Admin") -> PricingRecommendation:
    rec = db.query(PricingRecommendation).filter(PricingRecommendation.id == recommendation_id).first()
    if not rec:
        raise ValueError("Recommendation not found")

    room = db.query(Room).filter(Room.id == rec.room_id).first()
    old_price = room.current_price
    new_price = custom_price if (custom_price is not None and custom_price > 0) else rec.final_recommended_price

    room.current_price = new_price
    rec.status = "Approved"

    history = PriceHistory(
        room_id=room.id,
        old_price=old_price,
        new_price=new_price,
        reason=f"Approved recommendation: {rec.explanation}" + (f" (Custom override to ₹{new_price:,.0f})" if custom_price else ""),
        changed_by=user_name
    )
    db.add(history)
    db.commit()
    db.refresh(rec)
    return rec

def reject_recommendation(db: Session, recommendation_id: int, reason: str = "Admin rejected recommendation") -> PricingRecommendation:
    rec = db.query(PricingRecommendation).filter(PricingRecommendation.id == recommendation_id).first()
    if not rec:
        raise ValueError("Recommendation not found")
    rec.status = "Rejected"
    db.commit()
    db.refresh(rec)
    return rec

def recalculate_hotel_pricing(db: Session, hotel_id: int, target_date: Optional[datetime.date] = None):
    """
    Recalculates pricing across all rooms in the hotel for target date.
    Triggered after booking creation, cancellation, or event updates.
    """
    rooms = db.query(Room).filter(Room.hotel_id == hotel_id).all()
    for room in rooms:
        generate_recommendation_for_room(db, room.id, target_date=target_date)
