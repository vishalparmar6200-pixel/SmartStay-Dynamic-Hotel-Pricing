import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import WeatherData, Hotel
from app.schemas.schemas import WeatherDataResponse
from app.services.weather_service import get_or_create_weather

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("", response_model=List[WeatherDataResponse])
def get_weather_forecast(location: Optional[str] = None, days: int = 7, db: Session = Depends(get_db)):
    if not location:
        hotel = db.query(Hotel).first()
        location = hotel.city if hotel else "Jaipur"

    today = datetime.date.today()
    results = []
    for i in range(days):
        d = today + datetime.timedelta(days=i)
        w = get_or_create_weather(db, location, d)
        results.append(w)
    return results
