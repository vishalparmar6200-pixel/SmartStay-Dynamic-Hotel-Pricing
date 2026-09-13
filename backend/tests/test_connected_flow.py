import datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.models.models import Hotel, Room, User, Booking, PricingRule, PricingRecommendation
from app.services.booking_service import create_booking, cancel_booking
from app.services.recommendation_service import generate_recommendation_for_room, approve_recommendation
from app.schemas.schemas import BookingCreate

# In-memory test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine_test)
    db = TestingSessionLocal()
    try:
        # Setup initial hotel, rooms, admin, customer
        hotel = Hotel(name="Test Hotel", location="Jaipur", city="Jaipur", star_rating=4.5)
        db.add(hotel)
        db.commit()
        db.refresh(hotel)

        rules = PricingRule(hotel_id=hotel.id)
        db.add(rules)
        db.commit()

        admin = User(name="Admin", email="admin@test.com", password_hash="hash", role="ADMIN")
        cust = User(name="Customer", email="cust@test.com", password_hash="hash", role="CUSTOMER")
        db.add_all([admin, cust])
        db.commit()
        db.refresh(cust)

        room1 = Room(hotel_id=hotel.id, room_number="101", room_type="Deluxe", capacity=2, base_price=3000.0, current_price=3000.0)
        room2 = Room(hotel_id=hotel.id, room_number="102", room_type="Deluxe", capacity=2, base_price=3000.0, current_price=3000.0)
        db.add_all([room1, room2])
        db.commit()

        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine_test)

def test_full_connected_loop(db_session):
    hotel = db_session.query(Hotel).first()
    room = db_session.query(Room).filter(Room.room_number == "101").first()
    customer = db_session.query(User).filter(User.role == "CUSTOMER").first()

    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)

    # 1. Verify initial base price
    assert room.current_price == 3000.0

    # 2. Customer creates booking
    booking_in = BookingCreate(
        hotel_id=hotel.id,
        room_id=room.id,
        customer_id=customer.id,
        check_in=today,
        check_out=tomorrow,
        number_of_guests=2
    )
    booking = create_booking(db_session, booking_in, current_user=customer)
    assert booking.status == "Confirmed"

    # 3. Dynamic pricing engine runs recommendation
    rec = generate_recommendation_for_room(db_session, room.id, target_date=today)
    assert rec.final_recommended_price > 0
    assert rec.status == "Pending"

    # 4. Admin approves recommendation
    approved_rec = approve_recommendation(db_session, rec.id, user_name="Admin")
    assert approved_rec.status == "Approved"

    # 5. Room current price is updated
    db_session.refresh(room)
    assert room.current_price == approved_rec.final_recommended_price

    # 6. Customer cancels booking
    canceled_booking = cancel_booking(db_session, booking.id)
    assert canceled_booking.status == "Cancelled"
    assert canceled_booking.cancellation_status is True
