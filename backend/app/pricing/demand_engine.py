"""
SmartStay Demand Score Engine
-----------------------------
A transparent, fully rule-based demand scoring engine combining real-time
hotel occupancy, recent booking velocity, calendar events, weekends,
seasonality, and weather conditions.

Outputs an explainable score between 0 and 100.
IMPORTANT: Strictly rule-based, no ML/black-box algorithms.
"""

from typing import Dict, Any, Tuple
from app.models.models import PricingRule

def get_occupancy_subscore(occupancy_rate: float) -> float:
    """
    Evaluates occupancy contribution on a 0-100 scale:
    < 30%: Low (0 - 30)
    30 - 60%: Moderate (30 - 65)
    60 - 80%: High (65 - 85)
    80 - 100%: Very High (85 - 100)
    """
    occ = max(0.0, min(100.0, occupancy_rate))
    if occ < 30.0:
        return (occ / 30.0) * 30.0
    elif occ < 60.0:
        return 30.0 + ((occ - 30.0) / 30.0) * 35.0
    elif occ < 80.0:
        return 65.0 + ((occ - 60.0) / 20.0) * 20.0
    else:
        return 85.0 + ((occ - 80.0) / 20.0) * 15.0

def get_booking_velocity_subscore(recent_bookings_7d: int, total_rooms: int = 20) -> float:
    """
    Evaluates booking velocity over the last 7 days relative to room capacity.
    """
    if total_rooms <= 0:
        total_rooms = 20
    weekly_turnover_ratio = (recent_bookings_7d / total_rooms)
    # Ratio >= 1.5 means very strong demand (score 100)
    score = (weekly_turnover_ratio / 1.5) * 100.0
    return max(0.0, min(100.0, score))

def get_weekend_subscore(day_of_week: str) -> float:
    """
    Friday = 50, Saturday = 100, Sunday = 50, Mon-Thu = 0
    """
    dow = day_of_week.capitalize()
    if dow == "Saturday":
        return 100.0
    elif dow in ["Friday", "Sunday"]:
        return 50.0
    return 0.0

def get_festival_subscore(festival_importance: str) -> float:
    """
    Evaluates festival impact level (0-100 scale)
    """
    f = festival_importance.lower() if festival_importance else "none"
    if f in ["peak", "diwali", "new year"]:
        return 100.0
    elif f in ["major", "holi", "christmas"]:
        return 85.0
    elif f in ["medium", "eid", "dusserah"]:
        return 60.0
    elif f in ["normal", "low", "holiday"]:
        return 40.0
    return 0.0

def get_event_subscore(event_importance: str) -> float:
    """
    Evaluates local event impact level (0-100 scale)
    """
    e = event_importance.lower() if event_importance else "none"
    if e in ["very high", "very_high", "ipl match", "mega concert"]:
        return 100.0
    elif e in ["high", "international conference"]:
        return 85.0
    elif e in ["medium", "wedding season", "expo"]:
        return 60.0
    elif e in ["low", "local meet"]:
        return 30.0
    return 0.0

def get_season_subscore(month: int) -> float:
    """
    Seasonality in Indian tourism (Rajasthan/Jaipur / Golden Triangle):
    - Peak Winter (Oct, Nov, Dec, Jan, Feb): 85-100
    - Shoulder (March, Sept): 60-70
    - Summer/Monsoon (April, May, June, July, August): 25-45
    """
    if month in [11, 12, 1]:
        return 100.0
    elif month in [10, 2]:
        return 85.0
    elif month in [3, 9]:
        return 65.0
    elif month in [7, 8]:
        return 40.0
    else: # 4, 5, 6 (peak summer heat)
        return 30.0

def get_weather_subscore(weather_condition: str) -> float:
    """
    Evaluates weather condition impact (0-100 scale)
    """
    w = weather_condition.lower() if weather_condition else "normal"
    if "excellent" in w or "perfect" in w:
        return 100.0
    elif "good" in w or "sunny" in w or "clear" in w:
        return 85.0
    elif "normal" in w or "cloudy" in w or "mild" in w:
        return 60.0
    elif "rain" in w and "heavy" not in w:
        return 35.0
    elif "heavy rain" in w or "storm" in w:
        return 20.0
    elif "extreme" in w or "heatwave" in w:
        return 10.0
    return 60.0

def calculate_demand_score(
    occupancy_rate: float,
    recent_bookings_7d: int = 10,
    day_of_week: str = "Wednesday",
    festival_importance: str = "None",
    event_importance: str = "None",
    month: int = 10,
    weather_condition: str = "Good",
    total_rooms: int = 20,
    rules: PricingRule = None
) -> Tuple[float, str, Dict[str, float]]:
    """
    Calculates composite demand score between 0 and 100 with configurable weights.
    Returns:
      (total_demand_score, demand_level, breakdown_dictionary)
    """
    # Weights configuration
    w_occ = rules.weight_occupancy if rules else 30.0
    w_book = rules.weight_recent_bookings if rules else 25.0
    w_fest = rules.weight_festival if rules else 15.0
    w_wknd = rules.weight_weekend if rules else 10.0
    w_evnt = rules.weight_event if rules else 10.0
    w_seas = rules.weight_season if rules else 5.0
    w_wthr = rules.weight_weather if rules else 5.0

    total_weight = w_occ + w_book + w_fest + w_wknd + w_evnt + w_seas + w_wthr
    if total_weight <= 0:
        total_weight = 100.0

    # Sub-scores (0-100 each)
    sub_occ = get_occupancy_subscore(occupancy_rate)
    sub_book = get_booking_velocity_subscore(recent_bookings_7d, total_rooms)
    sub_wknd = get_weekend_subscore(day_of_week)
    sub_fest = get_festival_subscore(festival_importance)
    sub_evnt = get_event_subscore(event_importance)
    sub_seas = get_season_subscore(month)
    sub_wthr = get_weather_subscore(weather_condition)

    # Weighted contributions
    c_occ = (sub_occ * w_occ) / total_weight
    c_book = (sub_book * w_book) / total_weight
    c_fest = (sub_fest * w_fest) / total_weight
    c_wknd = (sub_wknd * w_wknd) / total_weight
    c_evnt = (sub_evnt * w_evnt) / total_weight
    c_seas = (sub_seas * w_seas) / total_weight
    c_wthr = (sub_wthr * w_wthr) / total_weight

    total_score = round(c_occ + c_book + c_fest + c_wknd + c_evnt + c_seas + c_wthr, 1)
    total_score = max(0.0, min(100.0, total_score))

    # Demand Level mapping:
    # 0–30: Low, 31–60: Moderate, 61–80: High, 81–100: Very High
    if total_score <= 30.0:
        level = "Low"
    elif total_score <= 60.0:
        level = "Moderate"
    elif total_score <= 80.0:
        level = "High"
    else:
        level = "Very High"

    breakdown = {
        "occupancy": round(c_occ, 1),
        "recent_bookings": round(c_book, 1),
        "festival": round(c_fest, 1),
        "weekend": round(c_wknd, 1),
        "event": round(c_evnt, 1),
        "season": round(c_seas, 1),
        "weather": round(c_wthr, 1)
    }

    return total_score, level, breakdown
