# SmartStay REST API Documentation

Base URL: `http://localhost:8000/api`  
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`  
ReDoc Reference: `http://localhost:8000/redoc`

---

## 1. Authentication

### Register
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "name": "Rajesh Sharma",
    "email": "admin@smartstay.com",
    "password": "adminpassword",
    "role": "ADMIN"
  }
  ```
- **Response**: `200 OK` (User object)

### Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@smartstay.com",
    "password": "admin123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

---

## 2. Rooms Inventory

### List Rooms
- **Endpoint**: `GET /rooms`
- **Query Parameters**:
  - `hotel_id` (int, optional)
  - `room_type` (string, optional: Standard, Deluxe, Premium, Suite)
  - `status` (string, optional: Available, Occupied, Maintenance)
- **Response**: `200 OK` (Array of Room objects)

### Override Room Price
- **Endpoint**: `POST /rooms/{id}/override-price`
- **Request Body**:
  ```json
  {
    "new_price": 4800.0,
    "reason": "Special destination wedding corporate package"
  }
  ```
- **Response**: `200 OK` (Updated Room with PriceHistory record logged)

---

## 3. Bookings & Reservations

### Create Booking (Simulated)
- **Endpoint**: `POST /bookings`
- **Request Body**:
  ```json
  {
    "hotel_id": 1,
    "room_id": 102,
    "check_in": "2026-10-15",
    "check_out": "2026-10-18",
    "number_of_guests": 2,
    "customer_name": "Ananya Verma",
    "customer_email": "customer@smartstay.com"
  }
  ```
- **Response**: `200 OK` (Confirmed Booking object)
- **Side Effects**: Automatically increments occupancy for date span and triggers dynamic repricing recalculation.

### Cancel Booking
- **Endpoint**: `POST /bookings/{id}/cancel`
- **Response**: `200 OK`
- **Side Effects**: Restores room inventory to Available, decrements occupancy, and recalculates pricing.

---

## 4. Demand Scoring Engine

### Calculate On-Demand Demand Score
- **Endpoint**: `GET /demand/calculate`
- **Query Parameters**:
  - `occupancy_rate` (float, e.g. 82.0)
  - `recent_bookings_7d` (int, e.g. 14)
  - `day_of_week` (string, e.g. "Saturday")
  - `festival_importance` (string, e.g. "Major")
  - `event_importance` (string, e.g. "High")
  - `weather_condition` (string, e.g. "Good")
  - `month` (int, e.g. 11)
- **Response**:
  ```json
  {
    "demand_score": 89.2,
    "demand_level": "Very High",
    "breakdown": {
      "occupancy": 28.5,
      "recent_bookings": 22.0,
      "festival": 18.0,
      "weekend": 10.0,
      "event": 8.0,
      "season": 4.5,
      "weather": 4.0
    }
  }
  ```

---

## 5. Dynamic Pricing Engine

### Get Pricing Recommendations
- **Endpoint**: `GET /pricing/recommendations`
- **Query Parameters**: `status` (Pending, Approved, Rejected, Applied)
- **Response**: Array of recommendations with base price, multipliers, and explanation.

### Approve Recommendation
- **Endpoint**: `POST /pricing/recommendations/{id}/approve`
- **Request Body** (optional):
  ```json
  {
    "custom_price": 5200.0
  }
  ```
- **Response**: `200 OK` (Room selling price updated, audit log created)

### Reject Recommendation
- **Endpoint**: `POST /pricing/recommendations/{id}/reject`
- **Response**: `200 OK`

### Interactive Price Simulator
- **Endpoint**: `POST /pricing/simulate`
- **Request Body**:
  ```json
  {
    "base_price": 3000.0,
    "current_price": 3000.0,
    "occupancy_rate": 85.0,
    "is_weekend": true,
    "day_of_week": "Saturday",
    "festival_type": "Major",
    "festival_name": "Diwali Festival",
    "event_type": "High",
    "event_name": "Medical Conference",
    "weather_condition": "Good",
    "lead_time_days": 3,
    "rooms_available_pct": 15.0,
    "competitor_price": 4800.0,
    "enforce_daily_cap": false
  }
  ```
- **Response**:
  ```json
  {
    "base_price": 3000.0,
    "current_price": 3000.0,
    "demand_score": 91.2,
    "demand_level": "Very High",
    "total_multiplier": 1.72,
    "raw_recommended_price": 5160.0,
    "final_recommended_price": 5160.0,
    "price_change_pct": 72.0,
    "adjustments": [
      { "factor": "Occupancy", "percentage": 20.0, "amount": 600.0, "description": "Occupancy at 85.0%" },
      { "factor": "Weekend", "percentage": 10.0, "amount": 300.0, "description": "Saturday weekend premium" },
      { "factor": "Festival", "percentage": 25.0, "amount": 750.0, "description": "Festival demand: Diwali Festival" },
      { "factor": "Local Event", "percentage": 15.0, "amount": 450.0, "description": "Local event: Medical Conference" },
      { "factor": "Weather", "percentage": 2.0, "amount": 60.0, "description": "Weather factor (Good)" }
    ],
    "explanation": "Recommended price increased to ₹5,160 because occupancy is high (85%), peak Saturday weekend demand, upcoming festival (Diwali Festival), and high-interest local event (Medical Conference)."
  }
  ```

---

## 6. Analytics & Financial Reporting

### Dashboard KPIs
- **Endpoint**: `GET /analytics/kpis`
- **Response**:
  ```json
  {
    "today_bookings": 6,
    "today_revenue": 84500.0,
    "occupancy_rate": 78.5,
    "rooms_occupied": 19,
    "rooms_available": 5,
    "total_rooms": 24,
    "adr": 4250.0,
    "revpar": 3380.0,
    "demand_score": 82.0,
    "demand_level": "High",
    "pending_recommendations": 3
  }
  ```

### Fixed vs. Dynamic Strategy Comparison
- **Endpoint**: `GET /analytics/fixed-vs-dynamic`
- **Response**:
  ```json
  {
    "fixed_revenue": 850000.0,
    "dynamic_revenue": 972000.0,
    "difference": 122000.0,
    "uplift_pct": 14.35,
    "booking_count": 240,
    "disclaimer": "Historical simulation baseline comparison based on room base prices vs dynamic realized rates."
  }
  ```
