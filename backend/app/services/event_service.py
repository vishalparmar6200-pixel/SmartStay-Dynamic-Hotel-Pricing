import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import FestivalEvent

def get_event_and_festival_for_date(db: Session, date: datetime.date, location: Optional[str] = None) -> Tuple[Optional[FestivalEvent], Optional[FestivalEvent]]:
    """
    Returns (festival, local_event) for a target date.
    """
    # Festival or Holiday
    query_fest = db.query(FestivalEvent).filter(
        FestivalEvent.date == date,
        FestivalEvent.event_type.in_(["Festival", "Holiday"])
    )
    if location:
        query_fest = query_fest.filter(or_(FestivalEvent.location == location, FestivalEvent.location == "All", FestivalEvent.location == "India"))
    festival = query_fest.order_by(FestivalEvent.demand_impact.desc()).first()

    # Local Event (Conference, Concert, Match, Exhibition)
    query_event = db.query(FestivalEvent).filter(
        FestivalEvent.date == date,
        ~FestivalEvent.event_type.in_(["Festival", "Holiday"])
    )
    if location:
        query_event = query_event.filter(or_(FestivalEvent.location == location, FestivalEvent.location == "All"))
    local_event = query_event.order_by(FestivalEvent.demand_impact.desc()).first()

    return festival, local_event
