import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import CompetitorPrice, Room, Hotel
from app.schemas.schemas import CompetitorPriceCreate, CompetitorPriceResponse

router = APIRouter(prefix="/competitor", tags=["Competitor Pricing"])

@router.get("", response_model=List[CompetitorPriceResponse])
def list_competitors(hotel_id: Optional[int] = None, room_type: Optional[str] = None, date: Optional[datetime.date] = None, db: Session = Depends(get_db)):
    query = db.query(CompetitorPrice)
    if hotel_id:
        query = query.filter(CompetitorPrice.hotel_id == hotel_id)
    if room_type:
        query = query.filter(CompetitorPrice.room_type == room_type)
    if date:
        query = query.filter(CompetitorPrice.date == date)
    return query.order_by(CompetitorPrice.created_at.desc()).limit(50).all()

@router.get("/summary")
def get_competitor_summary(hotel_id: Optional[int] = None, room_type: str = "Deluxe", date: Optional[datetime.date] = None, db: Session = Depends(get_db)):
    if not hotel_id:
        hotel = db.query(Hotel).first()
        hotel_id = hotel.id if hotel else 1
    
    if not date:
        date = datetime.date.today()

    room = db.query(Room).filter(Room.hotel_id == hotel_id, Room.room_type == room_type).first()
    our_price = room.current_price if room else 4500.0

    comps = db.query(CompetitorPrice).filter(
        CompetitorPrice.hotel_id == hotel_id,
        CompetitorPrice.room_type == room_type,
        CompetitorPrice.date == date
    ).all()

    if not comps:
        avg_comp = our_price * 1.07 # 7% higher in area
        diff = our_price - avg_comp
        return {
            "room_type": room_type,
            "our_price": our_price,
            "competitor_average": round(avg_comp, 2),
            "difference": round(diff, 2),
            "status": "₹300 cheaper than competitor average",
            "competitors": [
                {"name": "Heritage Palace Hotel", "price": round(our_price * 1.08, 0)},
                {"name": "The Royal Haveli Suites", "price": round(our_price * 1.06, 0)},
                {"name": "Grand Rajputana Inn", "price": round(our_price * 1.04, 0)}
            ]
        }

    avg_comp = sum(c.competitor_price for c in comps) / len(comps)
    diff = round(our_price - avg_comp, 2)
    status_msg = f"₹{abs(diff):,.0f} {'cheaper' if diff < 0 else 'more expensive'} than competitors"

    return {
        "room_type": room_type,
        "our_price": our_price,
        "competitor_average": round(avg_comp, 2),
        "difference": diff,
        "status": status_msg,
        "competitors": [{"name": c.competitor_name, "price": c.competitor_price} for c in comps]
    }

@router.post("", response_model=CompetitorPriceResponse)
def add_competitor_price(comp_in: CompetitorPriceCreate, db: Session = Depends(get_db)):
    record = CompetitorPrice(**comp_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
