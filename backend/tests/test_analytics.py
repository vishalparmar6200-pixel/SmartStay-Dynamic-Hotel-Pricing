import datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.models import Hotel, Room, User, Booking
from app.analytics.analytics_service import get_dashboard_kpis, get_revenue_comparison

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

@pytest.fixture
def analytics_db():
    Base.metadata.create_all(bind=engine_test)
    db = TestingSessionLocal()
    try:
        hotel = Hotel(name="Test Hotel", location="Jaipur", city="Jaipur", star_rating=4.5)
        db.add(hotel)
        db.commit()
        db.refresh(hotel)

        cust = User(name="Guest", email="g@test.com", password_hash="hash", role="CUSTOMER")
        db.add(cust)
        db.commit()
        db.refresh(cust)

        room = Room(hotel_id=hotel.id, room_number="101", room_type="Deluxe", capacity=2, base_price=3000.0, current_price=3600.0)
        db.add(room)
        db.commit()
        db.refresh(room)

        today = datetime.date.today()
        # Booking with dynamic price paid 3600 vs base price 3000
        b = Booking(
            hotel_id=hotel.id,
            room_id=room.id,
            customer_id=cust.id,
            check_in=today,
            check_out=today + datetime.timedelta(days=1),
            booking_date=today,
            number_of_guests=2,
            price_paid=3600.0,
            status="Confirmed"
        )
        db.add(b)
        db.commit()

        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine_test)

def test_analytics_calculations(analytics_db):
    hotel = analytics_db.query(Hotel).first()
    kpis = get_dashboard_kpis(analytics_db, hotel.id)

    assert kpis["total_rooms"] >= 1
    assert kpis["occupancy_rate"] == 100.0
    assert kpis["today_revenue"] == 3600.0
    assert kpis["adr"] > 0
    assert kpis["revpar"] > 0

def test_fixed_vs_dynamic_comparison(analytics_db):
    hotel = analytics_db.query(Hotel).first()
    comp = get_revenue_comparison(analytics_db, hotel.id)

    assert "fixed_revenue" in comp
    assert "dynamic_revenue" in comp
    assert comp["dynamic_revenue"] > comp["fixed_revenue"]
    assert comp["difference"] > 0
    assert comp["uplift_pct"] > 0
