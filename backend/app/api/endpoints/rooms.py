from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Room, PriceHistory
from app.schemas.schemas import RoomCreate, RoomUpdate, RoomResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])

class PriceOverrideRequest(BaseModel):
    new_price: float
    reason: str = "Manual admin price override"

@router.get("", response_model=List[RoomResponse])
def list_rooms(
    hotel_id: Optional[int] = None,
    room_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)
    if hotel_id:
        query = query.filter(Room.hotel_id == hotel_id)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    if status:
        query = query.filter(Room.status == status)
    return query.order_by(Room.room_number).all()

@router.get("/{id}", response_model=RoomResponse)
def get_room(id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("", response_model=RoomResponse)
def create_room(room_in: RoomCreate, db: Session = Depends(get_db)):
    room = Room(**room_in.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@router.put("/{id}", response_model=RoomResponse)
def update_room(id: int, room_in: RoomUpdate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    data = room_in.model_dump(exclude_unset=True)
    old_price = room.current_price
    for key, value in data.items():
        setattr(room, key, value)

    # If price was updated, record in history
    if "current_price" in data and data["current_price"] != old_price:
        history = PriceHistory(
            room_id=room.id,
            old_price=old_price,
            new_price=data["current_price"],
            reason="Admin manual update via room edit",
            changed_by="Admin"
        )
        db.add(history)

    db.commit()
    db.refresh(room)
    return room

@router.delete("/{id}")
def delete_room(id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return {"message": f"Room {room.room_number} deleted successfully"}

@router.post("/{id}/override-price", response_model=RoomResponse)
def override_price(id: int, req: PriceOverrideRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    old_price = room.current_price
    room.current_price = req.new_price

    changed_by = current_user.name if current_user else "Admin"
    history = PriceHistory(
        room_id=room.id,
        old_price=old_price,
        new_price=req.new_price,
        reason=req.reason,
        changed_by=changed_by
    )
    db.add(history)
    db.commit()
    db.refresh(room)
    return room
