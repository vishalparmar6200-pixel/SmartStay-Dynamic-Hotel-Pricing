from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Hotel, PricingRule
from app.schemas.schemas import HotelCreate, HotelUpdate, HotelResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/hotels", tags=["Hotels"])

@router.get("", response_model=List[HotelResponse])
def list_hotels(db: Session = Depends(get_db)):
    return db.query(Hotel).all()

@router.get("/{id}", response_model=HotelResponse)
def get_hotel(id: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id == id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.post("", response_model=HotelResponse)
def create_hotel(hotel_in: HotelCreate, db: Session = Depends(get_db)):
    hotel = Hotel(**hotel_in.model_dump())
    db.add(hotel)
    db.commit()
    db.refresh(hotel)

    # Initialize default pricing rule for hotel
    rule = PricingRule(hotel_id=hotel.id)
    db.add(rule)
    db.commit()

    return hotel

@router.put("/{id}", response_model=HotelResponse)
def update_hotel(id: int, hotel_in: HotelUpdate, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id == id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    data = hotel_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(hotel, key, value)

    db.commit()
    db.refresh(hotel)
    return hotel
