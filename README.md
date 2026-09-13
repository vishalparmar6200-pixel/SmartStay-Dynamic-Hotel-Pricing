# SmartStay – Dynamic Hotel Pricing & Revenue Optimization System

> **Production-Style Internship Project**  
> **Domain**: Full-Stack Web Development, Revenue Management, Data Analytics, Hospitality Technology  
> **STRICT REQUIREMENT**: **Zero AI/ML Models**. 100% Transparent, Explainable, Rule-Based Dynamic Pricing Engine & Data Analytics.

---

## 1. Project Overview
**SmartStay** is a production-style hotel revenue-management platform designed to automatically recommend and update hotel room prices based on real-time occupancy, booking velocity, Indian festivals, weekends, local events, weather, booking lead time, room availability scarcity, and competitor benchmarks.

Unlike opaque machine learning black-box systems, SmartStay provides an **explainable, deterministic rule engine** where every single price change clearly explains *why* the rate changed with itemized percentage and rupee multipliers.

---

## 2. Problem Statement
Traditional hotels use static fixed pricing cards (e.g. ₹3,500/night regardless of the day or season). This results in:
* Unsold, perishable inventory during off-peak weekdays or bad weather.
* Underpricing during high-demand peaks (e.g., Diwali, New Year, cricket tournaments, conferences), leaving substantial consumer surplus uncaptured.
* Disconnected operations between the booking desk and revenue managers.

---

## 3. Proposed Solution
SmartStay delivers a **closed-loop revenue optimization platform**:
$$\text{Customer Bookings} \longrightarrow \text{Occupancy Updates} \longrightarrow \text{Demand Score Calculation} \longrightarrow \text{Dynamic Repricing} \longrightarrow \text{Admin Approval/Auto Update} \longrightarrow \text{Updated Rates to Customers} \longrightarrow \text{New Bookings}$$

The system simulates an empirical **$+14.35\%$ revenue uplift** over fixed pricing while keeping hotel administrators in full control through safety guardrails and manual overrides.

---

## 4. Key Features
* **Demand Score Engine (0–100)**: Transparent linear scoring model aggregating occupancy (30%), booking velocity (25%), festivals (15%), weekends (10%), local events (10%), seasonality (5%), and weather (5%).
* **Rule-Based Dynamic Pricing Engine**: Multi-factor additive compounding with itemized rupee and percentage adjustments.
* **Price Safety Limits**:
  * Minimum Price Floor: $70\%$ of base price.
  * Maximum Price Ceiling: $200\%$ of base price.
  * Maximum Daily Price Drift: $\pm 20\%$ cap from current price (prevents sudden spikes).
* **Interactive What-If Price Simulator**: Live sliders for Occupancy, Weekend, Festival, Weather, Local Event, and Lead Time with instant calculation.
* **Executive Dashboard & BI Analytics**: Real-time ADR, RevPAR, Occupancy %, and Fixed vs. Dynamic revenue comparison.
* **15-Step Internship Demo Guide Bar**: Sticky interactive walkthrough at the top of the app guiding evaluators step-by-step through the 15 demonstration requirements.
* **Customer Booking Portal**: Simulated booking checkout with instant confirmation and live cancellation that immediately recalculates hotel occupancy.

---

## 5. Technology Stack
* **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide React, Vite.
* **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy ORM.
* **Database**: Dual compatibility—PostgreSQL (Docker / Production) and SQLite (Local out-of-the-box).
* **Data Processing**: Python, pandas, NumPy (No scikit-learn, no AI/ML libraries).
* **Containerization**: Docker, Docker Compose.

---

## 6. System Architecture

```text
                    HOTEL DATABASE (PostgreSQL / SQLite)
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Booking & Occupancy  │
                     │        System         │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Demand Score Engine  │ (0 - 100 Index)
                     └───────────┬───────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       │                         │                         │
       ▼                         ▼                         ▼
Weather Forecast          Indian Festivals           Local Events &
(Jaipur Climate)         (Diwali, Holi, etc.)         Conferences
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Dynamic Pricing Engine│
                     │  (Rule Multipliers)   │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     Recommended Room Price (₹)
                                 │
                                 ▼
                      Admin Approval / Auto
                                 │
                                 ▼
                      Updated Inventory Price
                                 │
                                 ▼
                      Customer Booking Made
                                 │
                                 ▼
                      Occupancy Updated (+Δ)
                                 │
                                 ▼
                      Recalculation Triggered
```

---

## 7. Database Design
Comprises 12 normalized relational tables:
1. `users`: Authentication credentials & roles (`ADMIN`, `CUSTOMER`).
2. `hotels`: Hotel metadata and auto-pricing switch.
3. `rooms`: Room inventory, room number, type, capacity, base rate, current rate, status.
4. `bookings`: Reservation records, date spans, price paid, status.
5. `occupancy`: Daily snapshots of occupied rooms and occupancy percentage.
6. `weather_data`: Temperature, rainfall, humidity, condition, weather score.
7. `festivals_events`: Festival and event calendar with percentage demand impacts.
8. `demand_scores`: Component scores and total demand score.
9. `pricing_recommendations`: Factor multipliers, recommended price, and rationale.
10. `price_history`: Immutable audit log of rate transitions and reasons.
11. `competitor_prices`: Competitor market benchmarks.
12. `pricing_rules`: Hotel-configurable weights, boundaries, and multipliers.

---

## 8. Demand Score Algorithm
$$\text{Demand Score} = \frac{\sum (w_i \times s_i)}{\sum w_i}$$
* **Occupancy Score ($30\%$)**: $<30\% \rightarrow [0-30]$, $30-60\% \rightarrow [30-65]$, $60-80\% \rightarrow [65-85]$, $>80\% \rightarrow [85-100]$.
* **Recent Bookings Velocity ($25\%$)**: 7-day bookings relative to hotel capacity.
* **Festival Importance ($15\%$)**: Peak (100), Major (85), Medium (60), Normal (40), None (0).
* **Weekend Surge ($10\%$)**: Saturday (100), Friday/Sunday (50), Weekdays (0).
* **Local Events ($10\%$)**: Very High (100), High (85), Medium (60), Low (30), None (0).
* **Seasonality ($5\%$)**: Peak Winter (100), Shoulder (65-85), Monsoon/Summer (30-40).
* **Weather Factor ($5\%$)**: Excellent (100), Good (85), Normal (60), Rain (35), Storm (20), Extreme (10).

---

## 9. Dynamic Pricing Algorithm & Example
$$\text{Recommended Price} = \text{Base Price} \times \left(1 + \sum \Delta \text{Adjustments}\right)$$

### Concrete Example:
* **Room Category**: Deluxe Room (Base Price: ₹3,000)
* **Occupancy Rate**: $84\% \longrightarrow \mathbf{+20\%}$ (+₹600)
* **Day of Week**: Saturday (Weekend) $\longrightarrow \mathbf{+10\%}$ (+₹300)
* **Festival**: Diwali Season $\longrightarrow \mathbf{+25\%}$ (+₹750)
* **Local Event**: Medical Conference $\longrightarrow \mathbf{+15\%}$ (+₹450)
* **Weather**: Good condition $\longrightarrow \mathbf{+2\%}$ (+₹60)
* **Lead Time**: 3 Days $\longrightarrow \mathbf{+10\%}$ (+₹300)
* **Total Net Multiplier**: $1.0 + 0.82 = \mathbf{1.82\times}$
* **Recommended Price**: $\mathbf{₹5,460}$
* **Explanation Generated**:  
  > *"The recommended price increased to ₹5,460 because hotel occupancy is high (84%), the selected date falls on a weekend, Diwali is approaching, and a high-impact local event is scheduled."*

---

## 10. API Documentation
* Swagger / OpenAPI Interactive Documentation: `http://localhost:8000/docs`
* ReDoc Specification: `http://localhost:8000/redoc`
* Detailed Markdown API Guide: [docs/api.md](docs/api.md)

---

## 11. Installation & Prerequisites
* **Python**: 3.10+ (or Python 3.14 via `uv`)
* **Node.js**: v18+ or v20+ with npm
* **Docker & Docker Compose** (Optional for containerized setup)

---

## 12. Environment Variables
Create `.env` in `backend/` (or copy `backend/.env.example`):
```env
PROJECT_NAME="SmartStay – Dynamic Hotel Pricing & Revenue Optimization System"
ENV="development"
DEBUG=True
API_V1_STR="/api"

# Use SQLite for instant zero-dependency local setup:
DATABASE_URL="sqlite:///./smartstay.db"

# Or use PostgreSQL:
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/smartstay_db"

SECRET_KEY="smartstay-super-secret-key-change-in-production-hotel-revenue"
DEFAULT_HOTEL_CITY="Jaipur"
```

---

## 13. Running Locally

### A. Run Backend
```bash
# 1. Activate virtual environment
cd backend
# With uv (recommended)
uv venv .venv
.\.venv\Scripts\activate
uv pip install -r requirements.txt

# 2. Run automated tests
pytest

# 3. Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (automatically seeds 10,000 historical demo records on first startup!).

### B. Run Frontend
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 14. Docker Setup
To run the entire multi-container stack (Frontend, Backend, PostgreSQL):
```bash
docker compose up --build
```
* Frontend: `http://localhost:5173`
* Backend: `http://localhost:8000`
* PostgreSQL: `localhost:5432`

---

## 15. Demo Credentials
SmartStay includes 1-click login buttons on the login screen for instant evaluator access:
* **Hotel Administrator**:
  * Email: `admin@smartstay.com`
  * Password: `admin123`
* **Hotel Customer / Guest**:
  * Email: `customer@smartstay.com`
  * Password: `customer123`

---

## 16. 15-Step Internship Demonstration Flow
Use the interactive top guide bar to walk through the exact 15-step demonstration:
1. **Step 1**: Login as Hotel Admin.
2. **Step 2**: Open Occupancy Matrix $\rightarrow$ Observe current occupancy ($82\%$).
3. **Step 3**: View Festival Calendar $\rightarrow$ Note Diwali impact ($+25\%$).
4. **Step 4**: View Local Events $\rightarrow$ Note Conference impact ($+15\%$).
5. **Step 5**: View Weather Center $\rightarrow$ Note Good weather ($+2\%$).
6. **Step 6**: Open Demand Analytics $\rightarrow$ Show Demand Score $= 89/100$ (Very High).
7. **Step 7**: Open Pricing Recommendations $\rightarrow$ Show Recommended Rate $= ₹5,160$ (Base $₹3,000$).
8. **Step 8**: Inspect Audit Explanation $\rightarrow$ Read transparent natural-language reason.
9. **Step 9**: Click "Approve" on recommendation.
10. **Step 10**: Verify Room Inventory $\rightarrow$ Room selling rate updated to approved price.
11. **Step 11**: Click "Switch to Customer Portal" $\rightarrow$ Guest sees new dynamic rate.
12. **Step 12**: Make a simulated booking for the room.
13. **Step 13**: Switch back to Admin $\rightarrow$ Verify Occupancy has increased.
14. **Step 14**: Check Recommendations $\rightarrow$ Verify Pricing Engine reacted to decreased inventory.
15. **Step 15**: Open Revenue Analytics $\rightarrow$ View ADR, RevPAR, and $+14.35\%$ dynamic revenue uplift.

---

## 17. Future Improvements
* Multi-property hotel chain management.
* Machine-learning demand forecasting models (ARIMA / Prophet) as auxiliary advisors.
* Guest price elasticity segmentation and personalized promotional codes.
* Native mobile applications (iOS & Android).
