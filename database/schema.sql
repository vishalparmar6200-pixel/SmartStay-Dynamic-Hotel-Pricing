-- ====================================================================
-- SmartStay: Dynamic Hotel Pricing & Revenue Optimization System
-- Relational Database Schema DDL (PostgreSQL)
-- ====================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER', -- ADMIN, CUSTOMER
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. HOTELS
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Jaipur',
    latitude FLOAT DEFAULT 26.9124,
    longitude FLOAT DEFAULT 75.7873,
    star_rating FLOAT NOT NULL DEFAULT 4.5,
    auto_pricing_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- Standard, Deluxe, Premium, Suite
    capacity INTEGER NOT NULL DEFAULT 2,
    base_price FLOAT NOT NULL,
    current_price FLOAT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Available', -- Available, Occupied, Maintenance
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_type ON rooms(hotel_id, room_type);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id),
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    customer_id INTEGER NOT NULL REFERENCES users(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    booking_date DATE DEFAULT CURRENT_DATE,
    number_of_guests INTEGER NOT NULL DEFAULT 2,
    price_paid FLOAT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Confirmed', -- Confirmed, Completed, Cancelled
    cancellation_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(hotel_id, check_in, check_out);

-- 5. OCCUPANCY
CREATE TABLE IF NOT EXISTS occupancy (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id),
    room_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 10,
    occupied_rooms INTEGER NOT NULL DEFAULT 0,
    available_rooms INTEGER NOT NULL DEFAULT 10,
    occupancy_rate FLOAT NOT NULL DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_occupancy_date ON occupancy(hotel_id, room_type, date);

-- 6. WEATHER_DATA
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    temperature FLOAT NOT NULL,
    rainfall FLOAT NOT NULL DEFAULT 0.0,
    humidity FLOAT NOT NULL DEFAULT 50.0,
    weather_condition VARCHAR(50) NOT NULL DEFAULT 'Sunny',
    weather_score FLOAT NOT NULL DEFAULT 5.0
);

CREATE INDEX IF NOT EXISTS idx_weather_date ON weather_data(location, date);

-- 7. FESTIVALS_EVENTS
CREATE TABLE IF NOT EXISTS festivals_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- Festival, Holiday, Conference, Concert, Match, Exhibition
    importance VARCHAR(30) NOT NULL DEFAULT 'Medium', -- Low, Medium, Major, Peak
    demand_impact FLOAT NOT NULL DEFAULT 15.0,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_date ON festivals_events(date);

-- 8. DEMAND_SCORES
CREATE TABLE IF NOT EXISTS demand_scores (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id),
    room_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    occupancy_score FLOAT NOT NULL DEFAULT 0.0,
    booking_score FLOAT NOT NULL DEFAULT 0.0,
    weekend_score FLOAT NOT NULL DEFAULT 0.0,
    festival_score FLOAT NOT NULL DEFAULT 0.0,
    event_score FLOAT NOT NULL DEFAULT 0.0,
    weather_score FLOAT NOT NULL DEFAULT 0.0,
    season_score FLOAT NOT NULL DEFAULT 0.0,
    total_demand_score FLOAT NOT NULL DEFAULT 0.0,
    demand_level VARCHAR(30) NOT NULL DEFAULT 'Low', -- Low, Moderate, High, Very High
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_demand_date ON demand_scores(hotel_id, date);

-- 9. PRICING_RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS pricing_recommendations (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    base_price FLOAT NOT NULL,
    demand_multiplier FLOAT NOT NULL DEFAULT 1.0,
    occupancy_multiplier FLOAT NOT NULL DEFAULT 1.0,
    weekend_multiplier FLOAT NOT NULL DEFAULT 1.0,
    festival_multiplier FLOAT NOT NULL DEFAULT 1.0,
    weather_multiplier FLOAT NOT NULL DEFAULT 1.0,
    event_multiplier FLOAT NOT NULL DEFAULT 1.0,
    lead_time_multiplier FLOAT NOT NULL DEFAULT 1.0,
    competitor_multiplier FLOAT NOT NULL DEFAULT 1.0,
    final_recommended_price FLOAT NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Applied
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recs_room_date ON pricing_recommendations(room_id, date);

-- 10. PRICE_HISTORY
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    old_price FLOAT NOT NULL,
    new_price FLOAT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    changed_by VARCHAR(100) NOT NULL DEFAULT 'System',
    changed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. COMPETITOR_PRICES
CREATE TABLE IF NOT EXISTS competitor_prices (
    id SERIAL PRIMARY KEY,
    competitor_name VARCHAR(100) NOT NULL,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id),
    room_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    competitor_price FLOAT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. PRICING_RULES
CREATE TABLE IF NOT EXISTS pricing_rules (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL UNIQUE REFERENCES hotels(id) ON DELETE CASCADE,
    min_price_pct FLOAT NOT NULL DEFAULT 70.0,
    max_price_pct FLOAT NOT NULL DEFAULT 200.0,
    max_daily_change_pct FLOAT NOT NULL DEFAULT 20.0,
    auto_pricing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    weight_occupancy FLOAT NOT NULL DEFAULT 30.0,
    weight_recent_bookings FLOAT NOT NULL DEFAULT 25.0,
    weight_festival FLOAT NOT NULL DEFAULT 15.0,
    weight_weekend FLOAT NOT NULL DEFAULT 10.0,
    weight_event FLOAT NOT NULL DEFAULT 10.0,
    weight_season FLOAT NOT NULL DEFAULT 5.0,
    weight_weather FLOAT NOT NULL DEFAULT 5.0,
    weekend_fri_pct FLOAT NOT NULL DEFAULT 5.0,
    weekend_sat_pct FLOAT NOT NULL DEFAULT 10.0,
    weekend_sun_pct FLOAT NOT NULL DEFAULT 5.0,
    festival_normal_pct FLOAT NOT NULL DEFAULT 10.0,
    festival_medium_pct FLOAT NOT NULL DEFAULT 15.0,
    festival_major_pct FLOAT NOT NULL DEFAULT 25.0,
    festival_peak_pct FLOAT NOT NULL DEFAULT 35.0,
    event_low_pct FLOAT NOT NULL DEFAULT 5.0,
    event_medium_pct FLOAT NOT NULL DEFAULT 10.0,
    event_high_pct FLOAT NOT NULL DEFAULT 20.0,
    event_very_high_pct FLOAT NOT NULL DEFAULT 30.0,
    lead_time_0_1_pct FLOAT NOT NULL DEFAULT 20.0,
    lead_time_2_6_pct FLOAT NOT NULL DEFAULT 15.0,
    lead_time_7_14_pct FLOAT NOT NULL DEFAULT 10.0,
    lead_time_15_29_pct FLOAT NOT NULL DEFAULT 5.0,
    avail_under_10_pct FLOAT NOT NULL DEFAULT 20.0,
    avail_10_30_pct FLOAT NOT NULL DEFAULT 10.0,
    avail_30_50_pct FLOAT NOT NULL DEFAULT 5.0,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
