import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "CUSTOMER"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Hotel Schemas -----------------
class HotelBase(BaseModel):
    name: str
    location: str
    city: str = "Jaipur"
    latitude: Optional[float] = 26.9124
    longitude: Optional[float] = 75.7873
    star_rating: float = 4.5
    auto_pricing_enabled: bool = False

class HotelCreate(HotelBase):
    pass

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    star_rating: Optional[float] = None
    auto_pricing_enabled: Optional[bool] = None

class HotelResponse(HotelBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- Room Schemas -----------------
class RoomBase(BaseModel):
    hotel_id: int
    room_number: str
    room_type: str # Standard, Deluxe, Premium, Suite
    capacity: int = 2
    base_price: float
    current_price: float
    status: str = "Available"

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    base_price: Optional[float] = None
    current_price: Optional[float] = None
    status: Optional[str] = None

class RoomResponse(RoomBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- Booking Schemas -----------------
class BookingBase(BaseModel):
    hotel_id: int
    room_id: int
    check_in: datetime.date
    check_out: datetime.date
    number_of_guests: int = 2

class BookingCreate(BookingBase):
    customer_id: Optional[int] = None # Filled from auth user if available
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    hotel_id: int
    room_id: int
    customer_id: int
    check_in: datetime.date
    check_out: datetime.date
    booking_date: datetime.date
    number_of_guests: int
    price_paid: float
    status: str
    cancellation_status: bool
    created_at: datetime.datetime
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    customer_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Occupancy Schemas -----------------
class OccupancyResponse(BaseModel):
    id: int
    hotel_id: int
    room_type: str
    date: datetime.date
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    occupancy_rate: float

    class Config:
        from_attributes = True

# ----------------- Weather Schemas -----------------
class WeatherDataResponse(BaseModel):
    id: int
    location: str
    date: datetime.date
    temperature: float
    rainfall: float
    humidity: float
    weather_condition: str
    weather_score: float

    class Config:
        from_attributes = True

# ----------------- Event Schemas -----------------
class FestivalEventBase(BaseModel):
    name: str
    date: datetime.date
    location: str
    event_type: str
    importance: str
    demand_impact: float
    description: Optional[str] = None

class FestivalEventCreate(FestivalEventBase):
    pass

class FestivalEventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime.date] = None
    location: Optional[str] = None
    event_type: Optional[str] = None
    importance: Optional[str] = None
    demand_impact: Optional[float] = None
    description: Optional[str] = None

class FestivalEventResponse(FestivalEventBase):
    id: int
    class Config:
        from_attributes = True

# ----------------- Demand Score Schemas -----------------
class DemandScoreResponse(BaseModel):
    id: Optional[int] = None
    hotel_id: int
    room_type: str
    date: datetime.date
    occupancy_score: float
    booking_score: float
    weekend_score: float
    festival_score: float
    event_score: float
    weather_score: float
    season_score: float
    total_demand_score: float
    demand_level: str
    breakdown_pct: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True

# ----------------- Pricing Recommendation Schemas -----------------
class PricingRecommendationResponse(BaseModel):
    id: int
    room_id: int
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    date: datetime.date
    base_price: float
    current_price: Optional[float] = None
    demand_multiplier: float
    occupancy_multiplier: float
    weekend_multiplier: float
    festival_multiplier: float
    weather_multiplier: float
    event_multiplier: float
    lead_time_multiplier: float
    competitor_multiplier: float
    final_recommended_price: float
    explanation: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RecommendationActionRequest(BaseModel):
    action: str # approve, reject, apply
    custom_price: Optional[float] = None

# ----------------- Price History Schemas -----------------
class PriceHistoryResponse(BaseModel):
    id: int
    room_id: int
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    old_price: float
    new_price: float
    reason: str
    changed_by: str
    changed_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Competitor Price Schemas -----------------
class CompetitorPriceBase(BaseModel):
    competitor_name: str
    hotel_id: int
    room_type: str
    date: datetime.date
    competitor_price: float

class CompetitorPriceCreate(CompetitorPriceBase):
    pass

class CompetitorPriceResponse(CompetitorPriceBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- Pricing Rules Schemas -----------------
class PricingRuleBase(BaseModel):
    min_price_pct: float = 70.0
    max_price_pct: float = 200.0
    max_daily_change_pct: float = 20.0
    auto_pricing_enabled: bool = False
    
    weight_occupancy: float = 30.0
    weight_recent_bookings: float = 25.0
    weight_festival: float = 15.0
    weight_weekend: float = 10.0
    weight_event: float = 10.0
    weight_season: float = 5.0
    weight_weather: float = 5.0
    
    weekend_fri_pct: float = 5.0
    weekend_sat_pct: float = 10.0
    weekend_sun_pct: float = 5.0
    
    festival_normal_pct: float = 10.0
    festival_medium_pct: float = 15.0
    festival_major_pct: float = 25.0
    festival_peak_pct: float = 35.0
    
    event_low_pct: float = 5.0
    event_medium_pct: float = 10.0
    event_high_pct: float = 20.0
    event_very_high_pct: float = 30.0
    
    lead_time_0_1_pct: float = 20.0
    lead_time_2_6_pct: float = 15.0
    lead_time_7_14_pct: float = 10.0
    lead_time_15_29_pct: float = 5.0
    
    avail_under_10_pct: float = 20.0
    avail_10_30_pct: float = 10.0
    avail_30_50_pct: float = 5.0

class PricingRuleUpdate(PricingRuleBase):
    pass

class PricingRuleResponse(PricingRuleBase):
    id: int
    hotel_id: int
    updated_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

# ----------------- Simulation Schemas -----------------
class PriceSimulationRequest(BaseModel):
    base_price: float = 3000.0
    current_price: Optional[float] = 3000.0
    occupancy_rate: float = 50.0 # 0-100%
    is_weekend: bool = False
    day_of_week: Optional[str] = "Wednesday" # Monday, Friday, Saturday, etc.
    festival_type: str = "None" # None, Normal, Medium, Major, Peak
    festival_name: Optional[str] = None
    event_type: str = "None" # None, Low, Medium, High, Very High
    event_name: Optional[str] = None
    weather_condition: str = "Normal" # Excellent, Good, Normal, Rain, Heavy Rain, Extreme
    lead_time_days: int = 14
    rooms_available_pct: float = 50.0 # 0-100%
    competitor_price: Optional[float] = None
    enforce_daily_cap: bool = True

class AdjustmentDetail(BaseModel):
    factor: str
    percentage: float
    amount: float
    description: str

class PriceSimulationResponse(BaseModel):
    base_price: float
    current_price: float
    demand_score: float
    demand_level: str
    demand_breakdown: Dict[str, float]
    adjustments: List[AdjustmentDetail]
    total_multiplier: float
    raw_recommended_price: float
    final_recommended_price: float
    price_change_pct: float
    applied_limit: Optional[str] = None
    explanation: str
