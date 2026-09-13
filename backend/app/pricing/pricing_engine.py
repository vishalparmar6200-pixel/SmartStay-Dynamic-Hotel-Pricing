"""
SmartStay Rule-Based Dynamic Pricing Engine
-------------------------------------------
A completely transparent, explainable pricing calculation engine.
Calculates factor adjustments, compound multipliers, safety limits,
and natural language rationales.

STRICT RULE: Zero AI/ML models. Pure business rules & analytics.
"""

from typing import Dict, Any, List, Optional, Tuple
from app.models.models import PricingRule
from app.pricing.demand_engine import calculate_demand_score

def calculate_room_pricing(
    base_price: float,
    current_price: Optional[float] = None,
    occupancy_rate: float = 50.0,
    day_of_week: str = "Wednesday",
    festival_importance: str = "None",
    festival_name: Optional[str] = None,
    event_importance: str = "None",
    event_name: Optional[str] = None,
    weather_condition: str = "Good",
    lead_time_days: int = 14,
    rooms_available_pct: float = 50.0,
    competitor_price: Optional[float] = None,
    month: int = 10,
    recent_bookings_7d: int = 10,
    total_rooms: int = 20,
    rules: Optional[PricingRule] = None,
    enforce_daily_cap: bool = True
) -> Dict[str, Any]:
    """
    Computes explainable dynamic room pricing with all audit multipliers,
    safety boundaries, and human-readable explanation.
    """
    if current_price is None or current_price <= 0:
        current_price = base_price

    # 1. Calculate Demand Score
    demand_score, demand_level, demand_breakdown = calculate_demand_score(
        occupancy_rate=occupancy_rate,
        recent_bookings_7d=recent_bookings_7d,
        day_of_week=day_of_week,
        festival_importance=festival_importance,
        event_importance=event_importance,
        month=month,
        weather_condition=weather_condition,
        total_rooms=total_rooms,
        rules=rules
    )

    adjustments: List[Dict[str, Any]] = []
    explanation_parts: List[str] = []

    # 2. Occupancy Adjustment Rule
    # < 30%: 0%, 30-60%: +5%, 60-80%: +15%, 80-90%: +20%, >90%: +25%
    occ_adj_pct = 0.0
    if occupancy_rate >= 90.0:
        occ_adj_pct = 25.0
        explanation_parts.append(f"occupancy is exceptionally high ({occupancy_rate:.0f}%)")
    elif occupancy_rate >= 80.0:
        occ_adj_pct = 20.0
        explanation_parts.append(f"occupancy is high ({occupancy_rate:.0f}%)")
    elif occupancy_rate >= 60.0:
        occ_adj_pct = 15.0
        explanation_parts.append(f"occupancy is healthy ({occupancy_rate:.0f}%)")
    elif occupancy_rate >= 30.0:
        occ_adj_pct = 5.0
    else:
        occ_adj_pct = -5.0
        explanation_parts.append(f"occupancy is low ({occupancy_rate:.0f}%)")

    adjustments.append({
        "factor": "Occupancy",
        "percentage": occ_adj_pct,
        "amount": round(base_price * (occ_adj_pct / 100.0), 2),
        "description": f"Occupancy at {occupancy_rate:.1f}%"
    })

    # 3. Weekend Adjustment Rule
    dow = day_of_week.capitalize()
    wknd_adj_pct = 0.0
    fri_pct = rules.weekend_fri_pct if rules else 5.0
    sat_pct = rules.weekend_sat_pct if rules else 10.0
    sun_pct = rules.weekend_sun_pct if rules else 5.0

    if dow == "Saturday":
        wknd_adj_pct = sat_pct
        explanation_parts.append("peak Saturday weekend demand")
    elif dow == "Friday":
        wknd_adj_pct = fri_pct
        explanation_parts.append("Friday weekend surge")
    elif dow == "Sunday":
        wknd_adj_pct = sun_pct
        explanation_parts.append("Sunday leisure stay")
    
    if wknd_adj_pct > 0:
        adjustments.append({
            "factor": "Weekend",
            "percentage": wknd_adj_pct,
            "amount": round(base_price * (wknd_adj_pct / 100.0), 2),
            "description": f"{dow} weekend premium"
        })

    # 4. Festival Adjustment Rule
    fest_adj_pct = 0.0
    f_imp = festival_importance.lower() if festival_importance else "none"
    norm_pct = rules.festival_normal_pct if rules else 10.0
    med_pct = rules.festival_medium_pct if rules else 15.0
    maj_pct = rules.festival_major_pct if rules else 25.0
    peak_pct = rules.festival_peak_pct if rules else 35.0

    if f_imp in ["peak", "diwali", "new year"]:
        fest_adj_pct = peak_pct
    elif f_imp in ["major", "holi", "christmas"]:
        fest_adj_pct = maj_pct
    elif f_imp in ["medium", "eid", "dusserah"]:
        fest_adj_pct = med_pct
    elif f_imp in ["normal", "low", "holiday"]:
        fest_adj_pct = norm_pct

    if fest_adj_pct > 0:
        name_str = f" ({festival_name})" if festival_name else ""
        explanation_parts.append(f"upcoming festival{name_str}")
        adjustments.append({
            "factor": "Festival",
            "percentage": fest_adj_pct,
            "amount": round(base_price * (fest_adj_pct / 100.0), 2),
            "description": f"Festival demand: {festival_name or festival_importance}"
        })

    # 5. Local Event Adjustment Rule
    event_adj_pct = 0.0
    e_imp = event_importance.lower() if event_importance else "none"
    ev_low = rules.event_low_pct if rules else 5.0
    ev_med = rules.event_medium_pct if rules else 10.0
    ev_hi = rules.event_high_pct if rules else 20.0
    ev_vhi = rules.event_very_high_pct if rules else 30.0

    if e_imp in ["very high", "very_high", "ipl match"]:
        event_adj_pct = ev_vhi
    elif e_imp in ["high", "international conference"]:
        event_adj_pct = ev_hi
    elif e_imp in ["medium", "wedding season"]:
        event_adj_pct = ev_med
    elif e_imp in ["low", "expo"]:
        event_adj_pct = ev_low

    if event_adj_pct > 0:
        ev_str = f" ({event_name})" if event_name else ""
        explanation_parts.append(f"high-interest local event{ev_str}")
        adjustments.append({
            "factor": "Local Event",
            "percentage": event_adj_pct,
            "amount": round(base_price * (event_adj_pct / 100.0), 2),
            "description": f"Local event: {event_name or event_importance}"
        })

    # 6. Weather Adjustment Rule
    w_cond = weather_condition.lower() if weather_condition else "normal"
    weather_adj_pct = 0.0
    if "excellent" in w_cond:
        weather_adj_pct = 5.0
        explanation_parts.append("excellent weather conditions")
    elif "good" in w_cond:
        weather_adj_pct = 2.0
    elif "rain" in w_cond and "heavy" not in w_cond:
        weather_adj_pct = -5.0
        explanation_parts.append("rainfall forecast")
    elif "heavy rain" in w_cond or "storm" in w_cond:
        weather_adj_pct = -10.0
        explanation_parts.append("heavy rain warning")
    elif "extreme" in w_cond:
        weather_adj_pct = -15.0
        explanation_parts.append("extreme weather alert")

    if weather_adj_pct != 0.0:
        adjustments.append({
            "factor": "Weather",
            "percentage": weather_adj_pct,
            "amount": round(base_price * (weather_adj_pct / 100.0), 2),
            "description": f"Weather factor ({weather_condition})"
        })

    # 7. Booking Lead Time Adjustment
    lead_adj_pct = 0.0
    lt_0_1 = rules.lead_time_0_1_pct if rules else 20.0
    lt_2_6 = rules.lead_time_2_6_pct if rules else 15.0
    lt_7_14 = rules.lead_time_7_14_pct if rules else 10.0
    lt_15_29 = rules.lead_time_15_29_pct if rules else 5.0

    if lead_time_days <= 1:
        lead_adj_pct = lt_0_1
        explanation_parts.append("last-minute booking urgency (<=1 day)")
    elif lead_time_days <= 6:
        lead_adj_pct = lt_2_6
        explanation_parts.append(f"short lead time ({lead_time_days} days)")
    elif lead_time_days <= 14:
        lead_adj_pct = lt_7_14
    elif lead_time_days <= 29:
        lead_adj_pct = lt_15_29

    if lead_adj_pct > 0:
        adjustments.append({
            "factor": "Lead Time",
            "percentage": lead_adj_pct,
            "amount": round(base_price * (lead_adj_pct / 100.0), 2),
            "description": f"Booking lead time: {lead_time_days} days"
        })

    # 8. Room Availability Scarcity
    avail_adj_pct = 0.0
    av_10 = rules.avail_under_10_pct if rules else 20.0
    av_30 = rules.avail_10_30_pct if rules else 10.0
    av_50 = rules.avail_30_50_pct if rules else 5.0

    if rooms_available_pct < 10.0:
        avail_adj_pct = av_10
        explanation_parts.append("critical room scarcity (<10% available)")
    elif rooms_available_pct < 30.0:
        avail_adj_pct = av_30
        explanation_parts.append("limited room inventory (<30% available)")
    elif rooms_available_pct < 50.0:
        avail_adj_pct = av_50

    if avail_adj_pct > 0:
        adjustments.append({
            "factor": "Room Scarcity",
            "percentage": avail_adj_pct,
            "amount": round(base_price * (avail_adj_pct / 100.0), 2),
            "description": f"Availability scarcity ({rooms_available_pct:.1f}% remaining)"
        })

    # 9. Competitor Benchmark Adjustment (Optional alignment)
    comp_adj_pct = 0.0
    if competitor_price and competitor_price > 0:
        # If competitor price is significantly higher (>15%), we capture safe surplus
        price_gap_ratio = (competitor_price - base_price) / base_price
        if price_gap_ratio > 0.20:
            comp_adj_pct = 5.0
            explanation_parts.append("strong competitor market rate alignment")
        elif price_gap_ratio < -0.15:
            comp_adj_pct = -5.0
            explanation_parts.append("competitive discount to match market")
        
        if comp_adj_pct != 0.0:
            adjustments.append({
                "factor": "Competitor Benchmark",
                "percentage": comp_adj_pct,
                "amount": round(base_price * (comp_adj_pct / 100.0), 2),
                "description": f"Market price reference: ₹{competitor_price:,.0f}"
            })

    # 10. Total Compound Adjustment
    net_percentage = sum(item["percentage"] for item in adjustments)
    total_multiplier = 1.0 + (net_percentage / 100.0)
    raw_recommended_price = round(base_price * total_multiplier, 0)

    # 11. Safety Guardrails & Boundaries
    min_pct = rules.min_price_pct if rules else 70.0
    max_pct = rules.max_price_pct if rules else 200.0
    max_daily_pct = rules.max_daily_change_pct if rules else 20.0

    min_price_bound = round(base_price * (min_pct / 100.0), 0)
    max_price_bound = round(base_price * (max_pct / 100.0), 0)

    final_price = raw_recommended_price
    applied_limit = None

    # Check minimum floor
    if final_price < min_price_bound:
        final_price = min_price_bound
        applied_limit = f"Minimum price limit applied ({min_pct}% of base = ₹{min_price_bound:,.0f})"
    
    # Check maximum ceiling
    if final_price > max_price_bound:
        final_price = max_price_bound
        applied_limit = f"Maximum price ceiling applied ({max_pct}% of base = ₹{max_price_bound:,.0f})"

    # Check daily change rate limit (max 20% swing from current price unless overridden)
    if enforce_daily_cap and current_price and current_price > 0:
        max_up = round(current_price * (1.0 + (max_daily_pct / 100.0)), 0)
        max_down = round(current_price * (1.0 - (max_daily_pct / 100.0)), 0)
        if final_price > max_up:
            final_price = max_up
            applied_limit = f"Daily max increase capped at +{max_daily_pct}% (₹{max_up:,.0f})"
        elif final_price < max_down:
            final_price = max_down
            applied_limit = f"Daily max decrease capped at -{max_daily_pct}% (₹{max_down:,.0f})"

    price_change_pct = round(((final_price - current_price) / current_price) * 100.0, 1) if current_price else 0.0

    # 12. Synthesize Natural Language Explanation
    if not explanation_parts:
        explanation = "Standard room pricing applied under baseline market conditions."
    else:
        reasons_text = ", ".join(explanation_parts)
        if final_price >= current_price:
            explanation = f"Recommended price increased to ₹{final_price:,.0f} because {reasons_text}."
        else:
            explanation = f"Recommended price adjusted to ₹{final_price:,.0f} to stimulate demand as {reasons_text}."

    if applied_limit:
        explanation += f" Note: {applied_limit}."

    return {
        "base_price": base_price,
        "current_price": current_price,
        "demand_score": demand_score,
        "demand_level": demand_level,
        "demand_breakdown": demand_breakdown,
        "adjustments": adjustments,
        "total_multiplier": round(total_multiplier, 3),
        "raw_recommended_price": raw_recommended_price,
        "final_recommended_price": final_price,
        "price_change_pct": price_change_pct,
        "applied_limit": applied_limit,
        "explanation": explanation,
        "occupancy_rate": occupancy_rate,
        "lead_time_days": lead_time_days,
        "rooms_available_pct": rooms_available_pct
    }
