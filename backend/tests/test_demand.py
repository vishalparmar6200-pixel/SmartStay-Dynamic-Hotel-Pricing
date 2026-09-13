import pytest
from app.pricing.demand_engine import (
    calculate_demand_score,
    get_occupancy_subscore,
    get_weekend_subscore,
    get_festival_subscore,
    get_weather_subscore
)

def test_demand_score_bounds():
    # Test zero/baseline conditions
    score_low, level_low, _ = calculate_demand_score(
        occupancy_rate=0.0,
        recent_bookings_7d=0,
        day_of_week="Tuesday",
        festival_importance="None",
        event_importance="None",
        weather_condition="Rain",
        month=5
    )
    assert 0.0 <= score_low <= 35.0
    assert level_low in ["Low", "Moderate"]

    # Test peak conditions
    score_high, level_high, _ = calculate_demand_score(
        occupancy_rate=95.0,
        recent_bookings_7d=30,
        day_of_week="Saturday",
        festival_importance="Peak",
        event_importance="Very High",
        weather_condition="Excellent",
        month=12
    )
    assert 80.0 <= score_high <= 100.0
    assert level_high == "Very High"

def test_occupancy_subscore_thresholds():
    assert get_occupancy_subscore(15.0) == 15.0
    assert get_occupancy_subscore(30.0) == 30.0
    assert get_occupancy_subscore(60.0) == 65.0
    assert get_occupancy_subscore(80.0) == 85.0
    assert get_occupancy_subscore(100.0) == 100.0

def test_weekend_subscore():
    assert get_weekend_subscore("Saturday") == 100.0
    assert get_weekend_subscore("Friday") == 50.0
    assert get_weekend_subscore("Sunday") == 50.0
    assert get_weekend_subscore("Wednesday") == 0.0

def test_festival_subscore():
    assert get_festival_subscore("Peak") == 100.0
    assert get_festival_subscore("Diwali") == 100.0
    assert get_festival_subscore("Major") == 85.0
    assert get_festival_subscore("None") == 0.0
