import pytest
from app.pricing.pricing_engine import calculate_room_pricing

def test_pricing_calculation_factors():
    base_price = 3000.0
    res = calculate_room_pricing(
        base_price=base_price,
        current_price=base_price,
        occupancy_rate=82.0,
        day_of_week="Saturday",
        festival_importance="Major",
        festival_name="Diwali",
        event_importance="High",
        event_name="Concert",
        weather_condition="Good",
        lead_time_days=3,
        rooms_available_pct=18.0,
        enforce_daily_cap=False # test raw compounding
    )

    # Check that price increased above base
    assert res["final_recommended_price"] > base_price
    assert res["total_multiplier"] > 1.0
    assert len(res["adjustments"]) >= 5
    assert "Diwali" in res["explanation"] or "festival" in res["explanation"]
    assert res["demand_score"] > 60.0

def test_pricing_safety_limits_minimum_floor():
    base_price = 4000.0
    # Simulate massive negative factors
    res = calculate_room_pricing(
        base_price=base_price,
        current_price=base_price,
        occupancy_rate=10.0,
        day_of_week="Tuesday",
        festival_importance="None",
        event_importance="None",
        weather_condition="Extreme",
        lead_time_days=60,
        rooms_available_pct=90.0,
        enforce_daily_cap=False
    )
    # Minimum floor is 70% of 4000 = 2800
    assert res["final_recommended_price"] >= 2800.0

def test_pricing_safety_limits_maximum_ceiling():
    base_price = 3000.0
    # Simulate astronomical demand multipliers
    res = calculate_room_pricing(
        base_price=base_price,
        current_price=base_price,
        occupancy_rate=99.0,
        day_of_week="Saturday",
        festival_importance="Peak",
        event_importance="Very High",
        weather_condition="Excellent",
        lead_time_days=1,
        rooms_available_pct=2.0,
        enforce_daily_cap=False
    )
    # Maximum ceiling is 200% of 3000 = 6000
    assert res["final_recommended_price"] <= 6000.0

def test_pricing_daily_change_cap():
    base_price = 3000.0
    current_price = 3000.0
    res = calculate_room_pricing(
        base_price=base_price,
        current_price=current_price,
        occupancy_rate=95.0,
        day_of_week="Saturday",
        festival_importance="Peak",
        event_importance="Very High",
        weather_condition="Excellent",
        lead_time_days=1,
        enforce_daily_cap=True
    )
    # With 20% max daily change limit, price cannot exceed 3000 * 1.20 = 3600
    assert res["final_recommended_price"] <= 3600.0
    assert "Daily max increase capped" in res["applied_limit"]
