"""
SmartStay Synthetic Dataset Generator & Database Seeder
-------------------------------------------------------
Generates 10,000+ realistic historical hospitality records spanning 18 months
for an Indian heritage hotel in Jaipur, Rajasthan.

Strictly rule-based simulation incorporating:
- Indian tourist seasonality (winter peak, monsoon trough)
- Major Indian festivals (Diwali, Holi, Eid, Christmas, New Year)
- High-impact events (Jaipur Lit Fest, IPL cricket match, medical conferences)
- Weather impact and weekend premiums

NO ML / BLACK-BOX MODELS. Purely analytical & statistical generation.
"""

import os
import sys
import datetime
import random
import pandas as pd
import numpy as np

# Add backend directory to sys.path so it can import app modules if running standalone
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(os.path.dirname(CURRENT_DIR), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, Hotel, Room, Booking, Occupancy, WeatherData,
    FestivalEvent, DemandScore, PricingRecommendation,
    PriceHistory, CompetitorPrice, PricingRule
)
from app.services.auth_service import get_password_hash
from app.pricing.demand_engine import calculate_demand_score
from app.pricing.pricing_engine import calculate_room_pricing

FESTIVALS_DATA = [
    {"name": "Republic Day Weekend", "month": 1, "day": 26, "type": "Holiday", "importance": "Medium", "impact": 15.0},
    {"name": "Jaipur Literature Festival", "month": 1, "day": 28, "type": "Conference", "importance": "High", "impact": 20.0},
    {"name": "Maha Shivratri", "month": 3, "day": 8, "type": "Festival", "importance": "Low", "impact": 5.0},
    {"name": "Holi Carnival", "month": 3, "day": 25, "type": "Festival", "importance": "Major", "impact": 25.0},
    {"name": "IPL Cricket Match (Sawai Mansingh Stadium)", "month": 4, "day": 14, "type": "Match", "importance": "Very High", "impact": 30.0},
    {"name": "Eid al-Fitr", "month": 4, "day": 11, "type": "Festival", "importance": "Medium", "impact": 15.0},
    {"name": "Independence Day Long Weekend", "month": 8, "day": 15, "type": "Holiday", "importance": "Medium", "impact": 15.0},
    {"name": "International Medical Conference", "month": 9, "day": 20, "type": "Conference", "importance": "Medium", "impact": 10.0},
    {"name": "Navratri Festival", "month": 10, "day": 12, "type": "Festival", "importance": "Medium", "impact": 15.0},
    {"name": "Dussehra Celebrations", "month": 10, "day": 24, "type": "Festival", "importance": "Major", "impact": 20.0},
    {"name": "Diwali - Festival of Lights", "month": 11, "day": 1, "type": "Festival", "importance": "Peak", "impact": 35.0},
    {"name": "Pushkar Camel Fair", "month": 11, "day": 15, "type": "Exhibition", "importance": "High", "impact": 20.0},
    {"name": "Royal Destination Wedding Season", "month": 12, "day": 10, "type": "Exhibition", "importance": "High", "impact": 20.0},
    {"name": "Christmas Holidays", "month": 12, "day": 25, "type": "Festival", "importance": "Major", "impact": 25.0},
    {"name": "New Year Gala Eve", "month": 12, "day": 31, "type": "Peak", "importance": "Peak", "impact": 35.0},
]

ROOM_TYPES = [
    {"type": "Standard", "base_price": 2500.0, "count": 8, "capacity": 2},
    {"type": "Deluxe", "base_price": 3500.0, "count": 8, "capacity": 2},
    {"type": "Premium", "base_price": 5000.0, "count": 5, "capacity": 3},
    {"type": "Suite", "base_price": 8000.0, "count": 3, "capacity": 4},
]

def generate_csv_dataset(output_path: str, num_records: int = 10000):
    """
    Generates a realistic historical dataset and saves to CSV.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    random.seed(42)
    np.random.seed(42)

    start_date = datetime.date(2025, 1, 1)
    end_date = datetime.date(2026, 6, 30)
    total_days = (end_date - start_date).days

    rows = []
    
    for i in range(num_records):
        random_day_offset = random.randint(0, total_days)
        curr_date = start_date + datetime.timedelta(days=random_day_offset)
        dow = curr_date.strftime("%A")
        month = curr_date.month
        is_weekend = dow in ["Friday", "Saturday", "Sunday"]

        # Season
        if month in [11, 12, 1]:
            season = "Peak Winter"
            base_occ = 78.0
        elif month in [10, 2, 3]:
            season = "Shoulder"
            base_occ = 65.0
        elif month in [7, 8]:
            season = "Monsoon"
            base_occ = 50.0
        else:
            season = "Summer"
            base_occ = 42.0

        # Room config
        room_meta = random.choice(ROOM_TYPES)
        room_type = room_meta["type"]
        base_price = room_meta["base_price"]

        # Weather simulation
        if month in [7, 8]:
            weather_cond = random.choice(["Rain", "Heavy Rain", "Normal"])
            rainfall = random.uniform(10.0, 65.0) if "Rain" in weather_cond else 2.0
            temp = random.uniform(28.0, 33.0)
        elif month in [5, 6]:
            weather_cond = random.choice(["Normal", "Extreme"])
            rainfall = 0.0
            temp = random.uniform(38.0, 44.0)
        elif month in [11, 12, 1]:
            weather_cond = random.choice(["Good", "Excellent", "Sunny"])
            rainfall = 0.0
            temp = random.uniform(14.0, 24.0)
        else:
            weather_cond = random.choice(["Good", "Normal", "Sunny"])
            rainfall = random.uniform(0.0, 5.0)
            temp = random.uniform(24.0, 32.0)

        # Festival / Event check
        fest_match = next((f for f in FESTIVALS_DATA if f["month"] == month and abs(f["day"] - curr_date.day) <= 2), None)
        festival_imp = fest_match["importance"] if (fest_match and fest_match["type"] == "Festival") else "None"
        is_holiday = fest_match["type"] in ["Holiday", "Peak"] if fest_match else False
        local_event = fest_match["name"] if (fest_match and fest_match["type"] not in ["Festival", "Holiday"]) else "None"
        event_imp = fest_match["importance"] if (fest_match and fest_match["type"] not in ["Festival", "Holiday"]) else "None"

        # Occupancy rate calculation
        occ = base_occ
        if is_weekend:
            occ += random.uniform(8.0, 15.0)
        if festival_imp in ["Major", "Peak"]:
            occ += random.uniform(15.0, 25.0)
        if event_imp in ["High", "Very High"]:
            occ += random.uniform(10.0, 20.0)
        if "Rain" in weather_cond:
            occ -= random.uniform(5.0, 12.0)

        occ = max(15.0, min(98.0, occ + random.gauss(0, 4)))
        rooms_avail = max(1, int(24 * (1.0 - (occ / 100.0))))

        # Booking lead time & velocity
        lead_time = max(1, int(random.expovariate(1/12) + (3 if is_weekend else 7)))
        bookings_7d = max(2, int((occ / 100.0) * 18 + random.randint(-2, 3)))
        bookings_14d = bookings_7d * 2 + random.randint(-3, 4)
        bookings_30d = bookings_7d * 4 + random.randint(-5, 6)

        cancellation_rate = round(random.uniform(3.0, 14.0), 1)

        # Competitor price
        comp_price = round(base_price * (1.0 + (occ - 50.0)/200.0 + random.uniform(-0.05, 0.12)), -1)

        # Historical Demand Score
        hist_demand = round(max(10.0, min(100.0, (occ * 0.4) + (bookings_7d * 2.2) + (15 if is_weekend else 0) + (20 if festival_imp != "None" else 0))), 1)

        rows.append({
            "date": curr_date.isoformat(),
            "day_of_week": dow,
            "month": month,
            "season": season,
            "hotel_id": 1,
            "room_type": room_type,
            "base_price": base_price,
            "occupancy_rate": round(occ, 1),
            "rooms_available": rooms_avail,
            "bookings_last_7_days": bookings_7d,
            "bookings_last_14_days": bookings_14d,
            "bookings_last_30_days": bookings_30d,
            "cancellation_rate": cancellation_rate,
            "average_booking_lead_time": lead_time,
            "temperature": round(temp, 1),
            "rainfall": round(rainfall, 1),
            "weather_condition": weather_cond,
            "is_weekend": is_weekend,
            "is_holiday": is_holiday,
            "festival_importance": festival_imp,
            "local_event": local_event,
            "event_importance": event_imp,
            "competitor_price": comp_price,
            "historical_demand": hist_demand
        })

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Successfully generated {len(df)} records at {output_path}")

def seed_database():
    """
    Initializes database tables and populates with realistic demonstration records.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        hotel_count = db.query(Hotel).count()
        if hotel_count > 0:
            print("Database already contains hotel records. Re-synchronizing default recommendations...")
            # Ensure admin user exists
            admin = db.query(User).filter(User.email == "admin@smartstay.com").first()
            if not admin:
                db.add(User(
                    name="Rajesh Sharma",
                    email="admin@smartstay.com",
                    password_hash=get_password_hash("admin123"),
                    role="ADMIN"
                ))
                db.commit()
            return

        print("Seeding fresh SmartStay database...")

        # 1. Users
        admin_user = User(
            name="Rajesh Sharma (Revenue Director)",
            email="admin@smartstay.com",
            password_hash=get_password_hash("admin123"),
            role="ADMIN"
        )
        customer_user = User(
            name="Ananya Verma",
            email="customer@smartstay.com",
            password_hash=get_password_hash("customer123"),
            role="CUSTOMER"
        )
        guest_user = User(
            name="Vikram Malhotra",
            email="vikram@example.com",
            password_hash=get_password_hash("guest123"),
            role="CUSTOMER"
        )
        db.add_all([admin_user, customer_user, guest_user])
        db.commit()

        # 2. Hotel
        hotel = Hotel(
            name="The Grand Palace Heritage Resort & Spa",
            location="Amer Road, Near Jal Mahal",
            city="Jaipur",
            latitude=26.9664,
            longitude=75.8507,
            star_rating=4.8,
            auto_pricing_enabled=False
        )
        db.add(hotel)
        db.commit()
        db.refresh(hotel)

        # 3. Pricing Rule
        rules = PricingRule(
            hotel_id=hotel.id,
            min_price_pct=70.0,
            max_price_pct=200.0,
            max_daily_change_pct=20.0,
            auto_pricing_enabled=False,
            weight_occupancy=30.0,
            weight_recent_bookings=25.0,
            weight_festival=15.0,
            weight_weekend=10.0,
            weight_event=10.0,
            weight_season=5.0,
            weight_weather=5.0
        )
        db.add(rules)
        db.commit()

        # 4. Rooms (Total 24 rooms across 4 types)
        rooms_list = []
        room_idx = 101
        for meta in ROOM_TYPES:
            for i in range(meta["count"]):
                r = Room(
                    hotel_id=hotel.id,
                    room_number=f"{room_idx}",
                    room_type=meta["type"],
                    capacity=meta["capacity"],
                    base_price=meta["base_price"],
                    current_price=meta["base_price"],
                    status="Available"
                )
                rooms_list.append(r)
                room_idx += 1
        db.add_all(rooms_list)
        db.commit()

        # 5. Festivals and Events
        today = datetime.date.today()
        festivals_to_add = []
        for item in FESTIVALS_DATA:
            # Map into current / next year
            target_year = today.year if item["month"] >= today.month else today.year + 1
            f_date = datetime.date(target_year, item["month"], item["day"])
            fe = FestivalEvent(
                name=item["name"],
                date=f_date,
                location="Jaipur",
                event_type=item["type"],
                importance=item["importance"],
                demand_impact=item["impact"],
                description=f"Annual {item['type'].lower()} driving high hospitality demand in Jaipur region."
            )
            festivals_to_add.append(fe)
        db.add_all(festivals_to_add)
        db.commit()

        # 6. Seed Historical & Upcoming Bookings (Past 45 days + Next 14 days)
        all_rooms = db.query(Room).filter(Room.hotel_id == hotel.id).all()
        customers = [customer_user, guest_user]
        
        for day_offset in range(-45, 15):
            curr_date = today + datetime.timedelta(days=day_offset)
            dow = curr_date.strftime("%A")
            is_wknd = dow in ["Friday", "Saturday", "Sunday"]
            
            # Weather entry
            temp = 28.0 + (3.0 if curr_date.month in [4, 5, 6] else -5.0 if curr_date.month in [12, 1] else 0.0)
            cond = "Good" if not is_wknd else "Excellent"
            w_rec = WeatherData(
                location="Jaipur",
                date=curr_date,
                temperature=round(temp, 1),
                rainfall=0.0,
                humidity=52.0,
                weather_condition=cond,
                weather_score=8.5
            )
            db.add(w_rec)

            # Sample bookings to achieve realistic occupancy (60% to 85%)
            target_booked_rooms = random.randint(14, 20) if is_wknd else random.randint(10, 16)
            booked_sample = random.sample(all_rooms, min(len(all_rooms), target_booked_rooms))

            for room in booked_sample:
                nights = random.randint(1, 3)
                check_in_d = curr_date
                check_out_d = check_in_d + datetime.timedelta(days=nights)
                
                # Check if overlapping booking exists for room
                overlap = db.query(Booking).filter(
                    Booking.room_id == room.id,
                    Booking.check_in < check_out_d,
                    Booking.check_out > check_in_d
                ).first()

                if not overlap:
                    # Dynamic price paid
                    mult = 1.25 if is_wknd else 1.10
                    price_paid = round(room.base_price * mult * nights, 2)
                    b = Booking(
                        hotel_id=hotel.id,
                        room_id=room.id,
                        customer_id=random.choice(customers).id,
                        check_in=check_in_d,
                        check_out=check_out_d,
                        booking_date=check_in_d - datetime.timedelta(days=random.randint(2, 20)),
                        number_of_guests=room.capacity,
                        price_paid=price_paid,
                        status="Confirmed",
                        cancellation_status=False
                    )
                    db.add(b)

            db.commit()

            # Record Occupancy for room types
            for meta in ROOM_TYPES:
                rt = meta["type"]
                type_rooms = [r for r in all_rooms if r.room_type == rt]
                occ_count = db.query(Booking).join(Room).filter(
                    Booking.hotel_id == hotel.id,
                    Room.room_type == rt,
                    Booking.status == "Confirmed",
                    Booking.cancellation_status == False,
                    Booking.check_in <= curr_date,
                    Booking.check_out > curr_date
                ).count()
                
                tot = len(type_rooms)
                rate = round((occ_count / max(1, tot)) * 100.0, 1)
                db.add(Occupancy(
                    hotel_id=hotel.id,
                    room_type=rt,
                    date=curr_date,
                    total_rooms=tot,
                    occupied_rooms=occ_count,
                    available_rooms=max(0, tot - occ_count),
                    occupancy_rate=rate
                ))

            # Record Demand Score for today and recent days
            score, level, bdown = calculate_demand_score(
                occupancy_rate=78.5,
                recent_bookings_7d=14,
                day_of_week=dow,
                festival_importance="Major" if is_wknd else "None",
                event_importance="High" if is_wknd else "None",
                month=curr_date.month,
                weather_condition=cond,
                rules=rules
            )
            db.add(DemandScore(
                hotel_id=hotel.id,
                room_type="Deluxe",
                date=curr_date,
                occupancy_score=bdown["occupancy"],
                booking_score=bdown["recent_bookings"],
                weekend_score=bdown["weekend"],
                festival_score=bdown["festival"],
                event_score=bdown["event"],
                weather_score=bdown["weather"],
                season_score=bdown["season"],
                total_demand_score=score,
                demand_level=level
            ))

        db.commit()

        # 7. Seed Competitor Prices
        competitor_names = [
            "Heritage Haveli Palace Hotel",
            "The Royal Rajputana Inn",
            "Jaipur Marriott Courtyard"
        ]
        for c_name in competitor_names:
            for meta in ROOM_TYPES:
                cp = CompetitorPrice(
                    competitor_name=c_name,
                    hotel_id=hotel.id,
                    room_type=meta["type"],
                    date=today,
                    competitor_price=round(meta["base_price"] * random.uniform(1.05, 1.22), 0)
                )
                db.add(cp)
        db.commit()

        # 8. Seed Initial Recommendations & Price History for Demo
        deluxe_rooms = [r for r in all_rooms if r.room_type == "Deluxe"]
        sample_room = deluxe_rooms[0] if deluxe_rooms else all_rooms[0]

        calc = calculate_room_pricing(
            base_price=sample_room.base_price,
            current_price=sample_room.current_price,
            occupancy_rate=82.0,
            day_of_week="Saturday",
            festival_importance="Major",
            festival_name="Diwali Festival Season",
            event_importance="High",
            event_name="Jaipur Heritage Fest",
            weather_condition="Good",
            lead_time_days=3,
            rooms_available_pct=18.0,
            rules=rules
        )

        rec = PricingRecommendation(
            room_id=sample_room.id,
            date=today,
            base_price=sample_room.base_price,
            demand_multiplier=calc["total_multiplier"],
            occupancy_multiplier=1.20,
            weekend_multiplier=1.10,
            festival_multiplier=1.25,
            weather_multiplier=1.02,
            event_multiplier=1.15,
            lead_time_multiplier=1.10,
            competitor_multiplier=1.00,
            final_recommended_price=calc["final_recommended_price"],
            explanation=calc["explanation"],
            status="Pending"
        )
        db.add(rec)

        # Audit history samples
        for old_p, new_p, rsn, dt in [
            (3000.0, 3300.0, "Weekend adjustment (+10%)", today - datetime.timedelta(days=12)),
            (3300.0, 3800.0, "High occupancy surge (+15%)", today - datetime.timedelta(days=7)),
            (3800.0, 4700.0, "Festival approaching (+25%)", today - datetime.timedelta(days=3)),
            (4700.0, 3900.0, "Post-event demand stabilization", today - datetime.timedelta(days=1))
        ]:
            db.add(PriceHistory(
                room_id=sample_room.id,
                old_price=old_p,
                new_price=new_p,
                reason=rsn,
                changed_by="Pricing Engine",
                changed_at=datetime.datetime.combine(dt, datetime.time(10, 0))
            ))

        db.commit()
        print("SmartStay database successfully seeded with demo and historical records!")

    finally:
        db.close()

if __name__ == "__main__":
    csv_file = os.path.join(CURRENT_DIR, "processed", "historical_hotel_data.csv")
    generate_csv_dataset(csv_file, num_records=10000)
    seed_database()
