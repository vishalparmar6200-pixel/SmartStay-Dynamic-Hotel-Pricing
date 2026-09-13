import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import FestivalEvent
from app.schemas.schemas import FestivalEventCreate, FestivalEventUpdate, FestivalEventResponse

router = APIRouter(prefix="/events", tags=["Festivals & Events"])

@router.get("", response_model=List[FestivalEventResponse])
def list_events(
    event_type: Optional[str] = None,
    from_date: Optional[datetime.date] = None,
    to_date: Optional[datetime.date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FestivalEvent)
    if event_type:
        query = query.filter(FestivalEvent.event_type == event_type)
    if from_date:
        query = query.filter(FestivalEvent.date >= from_date)
    if to_date:
        query = query.filter(FestivalEvent.date <= to_date)
    return query.order_by(FestivalEvent.date).all()

@router.post("", response_model=FestivalEventResponse)
def create_event(event_in: FestivalEventCreate, db: Session = Depends(get_db)):
    event = FestivalEvent(**event_in.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{id}", response_model=FestivalEventResponse)
def update_event(id: int, event_in: FestivalEventUpdate, db: Session = Depends(get_db)):
    event = db.query(FestivalEvent).filter(FestivalEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    data = event_in.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(event, key, val)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{id}")
def delete_event(id: int, db: Session = Depends(get_db)):
    event = db.query(FestivalEvent).filter(FestivalEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": f"Event '{event.name}' deleted successfully"}
