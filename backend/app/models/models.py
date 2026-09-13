import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="CUSTOMER") # ADMIN, CUSTOMER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bookings = relationship("Booking", back_populates="customer")


class Hotel(Base):
    __tablename__ = "hotels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False, default="Jaipur")
    latitude = Column(Float, nullable=True, default=26.9124)
    longitude = Column(Float, nullable=True, default=75.7873)
    star_rating = Column(Float, nullable=False, default=4.5)
    auto_pricing_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel")
    pricing_rules = relationship("PricingRule", back_populates="hotel", uselist=False)


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_number = Column(String(20), nullable=False)
    room_type = Column(String(50), nullable=False) # Standard, Deluxe, Premium, Suite
    capacity = Column(Integer, nullable=False, default=2)
    base_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="Available") # Available, Occupied, Maintenance
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room")
    pricing_recommendations = relationship("PricingRecommendation", back_populates="room")
    price_histories = relationship("PriceHistory", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    booking_date = Column(Date, default=datetime.date.today)
    number_of_guests = Column(Integer, nullable=False, default=2)
    price_paid = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="Confirmed") # Confirmed, Completed, Cancelled
    cancellation_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    hotel = relationship("Hotel", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    customer = relationship("User", back_populates="bookings")


class Occupancy(Base):
    __tablename__ = "occupancy"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False, index=True)
    total_rooms = Column(Integer, nullable=False, default=10)
    occupied_rooms = Column(Integer, nullable=False, default=0)
    available_rooms = Column(Integer, nullable=False, default=10)
    occupancy_rate = Column(Float, nullable=False, default=0.0) # 0 to 100%


class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False)
    date = Column(Date, nullable=False, index=True)
    temperature = Column(Float, nullable=False) # in Celsius
    rainfall = Column(Float, nullable=False, default=0.0) # in mm
    humidity = Column(Float, nullable=False, default=50.0) # in %
    weather_condition = Column(String(50), nullable=False, default="Sunny") # Sunny, Good, Normal, Rain, Heavy Rain, Extreme
    weather_score = Column(Float, nullable=False, default=5.0) # 0 to 10


class FestivalEvent(Base):
    __tablename__ = "festivals_events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    date = Column(Date, nullable=False, index=True)
    location = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False) # Festival, Holiday, Conference, Concert, Match, Exhibition
    importance = Column(String(30), nullable=False, default="Medium") # Low, Medium, Major, Peak / High, Very High
    demand_impact = Column(Float, nullable=False, default=15.0) # +% impact
    description = Column(Text, nullable=True)


class DemandScore(Base):
    __tablename__ = "demand_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False, index=True)
    occupancy_score = Column(Float, nullable=False, default=0.0)
    booking_score = Column(Float, nullable=False, default=0.0)
    weekend_score = Column(Float, nullable=False, default=0.0)
    festival_score = Column(Float, nullable=False, default=0.0)
    event_score = Column(Float, nullable=False, default=0.0)
    weather_score = Column(Float, nullable=False, default=0.0)
    season_score = Column(Float, nullable=False, default=0.0)
    total_demand_score = Column(Float, nullable=False, default=0.0) # 0 to 100
    demand_level = Column(String(30), nullable=False, default="Low") # Low, Moderate, High, Very High
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PricingRecommendation(Base):
    __tablename__ = "pricing_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    base_price = Column(Float, nullable=False)
    demand_multiplier = Column(Float, nullable=False, default=1.0)
    occupancy_multiplier = Column(Float, nullable=False, default=1.0)
    weekend_multiplier = Column(Float, nullable=False, default=1.0)
    festival_multiplier = Column(Float, nullable=False, default=1.0)
    weather_multiplier = Column(Float, nullable=False, default=1.0)
    event_multiplier = Column(Float, nullable=False, default=1.0)
    lead_time_multiplier = Column(Float, nullable=False, default=1.0)
    competitor_multiplier = Column(Float, nullable=False, default=1.0)
    final_recommended_price = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="Pending") # Pending, Approved, Rejected, Applied
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("Room", back_populates="pricing_recommendations")


class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    old_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    reason = Column(String(255), nullable=False)
    changed_by = Column(String(100), nullable=False, default="System")
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("Room", back_populates="price_histories")


class CompetitorPrice(Base):
    __tablename__ = "competitor_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    competitor_name = Column(String(100), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False, index=True)
    competitor_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PricingRule(Base):
    __tablename__ = "pricing_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False, unique=True)
    
    # Boundary limits
    min_price_pct = Column(Float, nullable=False, default=70.0) # 70% of base
    max_price_pct = Column(Float, nullable=False, default=200.0) # 200% of base
    max_daily_change_pct = Column(Float, nullable=False, default=20.0) # max 20% swing
    auto_pricing_enabled = Column(Boolean, nullable=False, default=False)
    
    # Demand Score Weights (Total 100)
    weight_occupancy = Column(Float, nullable=False, default=30.0)
    weight_recent_bookings = Column(Float, nullable=False, default=25.0)
    weight_festival = Column(Float, nullable=False, default=15.0)
    weight_weekend = Column(Float, nullable=False, default=10.0)
    weight_event = Column(Float, nullable=False, default=10.0)
    weight_season = Column(Float, nullable=False, default=5.0)
    weight_weather = Column(Float, nullable=False, default=5.0)
    
    # Specific Rule Multipliers (%)
    weekend_fri_pct = Column(Float, nullable=False, default=5.0)
    weekend_sat_pct = Column(Float, nullable=False, default=10.0)
    weekend_sun_pct = Column(Float, nullable=False, default=5.0)
    
    festival_normal_pct = Column(Float, nullable=False, default=10.0)
    festival_medium_pct = Column(Float, nullable=False, default=15.0)
    festival_major_pct = Column(Float, nullable=False, default=25.0)
    festival_peak_pct = Column(Float, nullable=False, default=35.0)
    
    event_low_pct = Column(Float, nullable=False, default=5.0)
    event_medium_pct = Column(Float, nullable=False, default=10.0)
    event_high_pct = Column(Float, nullable=False, default=20.0)
    event_very_high_pct = Column(Float, nullable=False, default=30.0)
    
    lead_time_0_1_pct = Column(Float, nullable=False, default=20.0)
    lead_time_2_6_pct = Column(Float, nullable=False, default=15.0)
    lead_time_7_14_pct = Column(Float, nullable=False, default=10.0)
    lead_time_15_29_pct = Column(Float, nullable=False, default=5.0)
    
    avail_under_10_pct = Column(Float, nullable=False, default=20.0)
    avail_10_30_pct = Column(Float, nullable=False, default=10.0)
    avail_30_50_pct = Column(Float, nullable=False, default=5.0)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    hotel = relationship("Hotel", back_populates="pricing_rules")
