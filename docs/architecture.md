# SmartStay System Architecture & Technical Specification

## 1. Architectural Overview

SmartStay is an enterprise-grade hotel revenue management and dynamic pricing platform. Unlike opaque black-box machine-learning systems, SmartStay employs a **deterministic, rule-based dynamic pricing engine combined with statistical business intelligence**. Every pricing recommendation is mathematically derived and accompanied by a natural-language explanation.

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

## 2. Core Mathematical Engines

### A. Demand Score Engine ($0 - 100$)

The composite demand score evaluates real-time market pressure using weighted linear factor aggregation:

$$\text{Demand Score} = \frac{\sum_{i=1}^{n} (w_i \cdot s_i)}{\sum_{i=1}^{n} w_i}$$

Where default weights $w_i$ and sub-scores $s_i \in [0, 100]$ are:

| Factor | Default Weight ($w_i$) | Calculation Methodology |
| :--- | :---: | :--- |
| **Occupancy Rate** | $30\%$ | Stepped scaling: $<30\% \rightarrow [0, 30]$, $30-60\% \rightarrow [30, 65]$, $60-80\% \rightarrow [65, 85]$, $>80\% \rightarrow [85, 100]$ |
| **Booking Velocity** | $25\%$ | 7-day trailing booking count normalized against property room capacity |
| **Festival Importance** | $15\%$ | Calendar lookup: Normal ($40$), Medium ($60$), Major ($85$), Peak ($100$) |
| **Weekend Surge** | $10\%$ | Day-of-week impact: Saturday ($100$), Friday/Sunday ($50$), Weekdays ($0$) |
| **Local Events** | $10\%$ | Conferences, IPL matches, weddings: Low ($30$), Med ($60$), High ($85$), Very High ($100$) |
| **Seasonality** | $5\%$ | Rajasthan tourism cycle: Peak Winter ($100$), Shoulder ($65-85$), Summer/Monsoon ($30-40$) |
| **Weather Factor** | $5\%$ | Climate condition: Excellent ($100$), Good ($85$), Normal ($60$), Rain ($35$), Heavy Rain ($20$), Extreme ($10$) |

#### Demand Levels:
- **$0 - 30$**: Low Demand (Stimulation pricing)
- **$31 - 60$**: Moderate Demand (Baseline standard rates)
- **$61 - 80$**: High Demand (Yield management rate increase)
- **$81 - 100$**: Very High Demand (Aggressive RevPAR surge pricing)

---

### B. Rule-Based Dynamic Pricing Engine

The optimal selling price is computed via additive factor adjustments on the room's base price:

$$\text{Raw Price} = \text{Base Price} \times \left(1 + \sum_{k} \Delta_k\right)$$

Where each $\Delta_k$ is a configured percentage adjustment:

1. **Occupancy Adjustment ($\Delta_{\text{occ}}$)**:
   - Occupancy $\ge 90\%$: $+25\%$
   - Occupancy $80-89\%$: $+20\%$
   - Occupancy $60-79\%$: $+15\%$
   - Occupancy $30-59\%$: $+5\%$
   - Occupancy $<30\%$: $-5\%$ (Promotional discount)
2. **Weekend Adjustment ($\Delta_{\text{wknd}}$)**:
   - Saturday: $+10\%$
   - Friday & Sunday: $+5\%$
   - Monday–Thursday: $+0\%$
3. **Festival Adjustment ($\Delta_{\text{fest}}$)**:
   - Peak (New Year / Diwali): $+35\%$
   - Major (Holi / Christmas): $+25\%$
   - Medium (Eid / Dussehra): $+15\%$
   - Normal Holiday: $+10\%$
4. **Local Event Adjustment ($\Delta_{\text{evnt}}$)**:
   - Very High (IPL T20 / Mega Concert): $+30\%$
   - High (International Conference / Lit Fest): $+20\%$
   - Medium (Exhibition / Wedding Season): $+10\%$
   - Low: $+5\%$
5. **Weather Adjustment ($\Delta_{\text{wthr}}$)**:
   - Excellent weather: $+5\%$
   - Good weather: $+2\%$
   - Normal weather: $0\%$
   - Rainfall: $-5\%$
   - Heavy rain / storm: $-10\%$
   - Extreme weather / heatwave: $-15\%$
6. **Booking Lead Time Adjustment ($\Delta_{\text{lead}}$)**:
   - $\le 1$ day (Last minute urgency): $+20\%$
   - $2 - 6$ days: $+15\%$
   - $7 - 14$ days: $+10\%$
   - $15 - 29$ days: $+5\%$
   - $\ge 30$ days: $0\%$
7. **Room Inventory Scarcity ($\Delta_{\text{scarcity}}$)**:
   - $<10\%$ rooms available: $+20\%$
   - $10 - 29\%$ rooms available: $+10\%$
   - $30 - 49\%$ rooms available: $+5\%$
   - $\ge 50\%$ rooms available: $0\%$
8. **Competitor Alignment ($\Delta_{\text{comp}}$)**:
   - Market benchmark adjustment ensuring competitive yield.

---

### C. Guardrails & Safety Constraints

To protect hotel brand reputation and prevent jarring spikes, strict bounds are enforced:

$$\text{Final Price} = \text{clamp}\left(\text{Raw Price}, \text{Min Bound}, \text{Max Bound}\right)$$

1. **Price Floor**: $\text{Min Bound} = 0.70 \times \text{Base Price}$ (prevents selling below operational marginal cost).
2. **Price Ceiling**: $\text{Max Bound} = 2.00 \times \text{Base Price}$ (prevents perceived price gouging).
3. **Daily Drift Limit**: $|\text{Final Price} - \text{Current Price}| \le 0.20 \times \text{Current Price}$ (caps daily adjustment to $\pm 20\%$ unless overridden by an admin).

---

## 3. Revenue Metrics Formulas

- **Average Daily Rate (ADR)**:
  $$\text{ADR} = \frac{\text{Total Room Revenue}}{\text{Rooms Sold}}$$
- **Occupancy Rate**:
  $$\text{Occupancy Rate} = \frac{\text{Occupied Rooms}}{\text{Total Available Rooms}} \times 100\%$$
- **Revenue Per Available Room (RevPAR)**:
  $$\text{RevPAR} = \frac{\text{Total Room Revenue}}{\text{Total Available Rooms}} = \text{ADR} \times \text{Occupancy Rate}$$
- **Fixed vs. Dynamic Uplift**:
  $$\text{Revenue Uplift (\%)} = \frac{\text{Dynamic Revenue} - \text{Fixed Baseline Revenue}}{\text{Fixed Baseline Revenue}} \times 100\%$$

---

## 4. Closed Operational Loop

1. **Customer Booking**: Guest selects room and reserves stay.
2. **Occupancy Mutation**: `bookings` record inserted, room status set to Occupied, and daily `occupancy` table incremented.
3. **Event Propagation**: Occupancy service triggers `recalculate_hotel_pricing`.
4. **Demand Recomputation**: The Demand Score Engine calculates updated composite score.
5. **Dynamic Pricing Evaluation**: Rule engine computes new price recommendations.
6. **Execution**: If `auto_pricing_enabled` is true, inventory price is immediately updated and logged to `price_history`. In manual mode, it awaits admin approval.
7. **Market Feedback**: Subsequent guests browsing room search immediately see the updated rate.
