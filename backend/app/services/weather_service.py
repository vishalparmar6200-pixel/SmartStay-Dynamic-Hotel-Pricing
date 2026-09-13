import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import WeatherData
from app.core.config import settings

def get_or_create_weather(db: Session, location: str, date: datetime.date) -> WeatherData:
    """
    Retrieves weather data from DB or generates realistic climate observation for date.
    Works 100% offline without external API keys.
    """
    record = db.query(WeatherData).filter(
        WeatherData.location == location,
        WeatherData.date == date
    ).first()

    if record:
        return record

    month = date.month
    # Realistic weather simulation for Jaipur / North India
    if month in [12, 1]:
        temp = 18.5
        condition = "Sunny"
        rain = 0.0
        humidity = 45.0
        score = 8.5
    elif month in [2, 3]:
        temp = 25.0
        condition = "Good"
        rain = 2.0
        humidity = 40.0
        score = 9.0
    elif month in [4, 5, 6]:
        temp = 38.5
        condition = "Normal" # hot summer
        rain = 5.0
        humidity = 35.0
        score = 6.0
    elif month in [7, 8]:
        temp = 30.0
        condition = "Rain" # monsoon
        rain = 45.0
        humidity = 80.0
        score = 4.5
    elif month in [9, 10]:
        temp = 28.0
        condition = "Good"
        rain = 5.0
        humidity = 55.0
        score = 8.5
    else: # 11
        temp = 22.0
        condition = "Excellent"
        rain = 0.0
        humidity = 50.0
        score = 9.5

    record = WeatherData(
        location=location,
        date=date,
        temperature=temp,
        rainfall=rain,
        humidity=humidity,
        weather_condition=condition,
        weather_score=score
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
