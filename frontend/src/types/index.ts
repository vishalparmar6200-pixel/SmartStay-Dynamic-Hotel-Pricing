export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  created_at: string;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  star_rating: number;
  auto_pricing_enabled: boolean;
  created_at: string;
}

export interface Room {
  id: number;
  hotel_id: number;
  room_number: string;
  room_type: 'Standard' | 'Deluxe' | 'Premium' | 'Suite';
  capacity: number;
  base_price: number;
  current_price: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  created_at: string;
}

export interface Booking {
  id: number;
  hotel_id: number;
  room_id: number;
  customer_id: number;
  check_in: string;
  check_out: string;
  booking_date: string;
  number_of_guests: number;
  price_paid: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  cancellation_status: boolean;
  created_at: string;
  room_number?: string;
  room_type?: string;
  customer_name?: string;
}

export interface OccupancyRecord {
  id: number;
  hotel_id: number;
  room_type: string;
  date: string;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_rate: number;
}

export interface WeatherRecord {
  id: number;
  location: string;
  date: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  weather_condition: string;
  weather_score: number;
}

export interface FestivalEvent {
  id: number;
  name: string;
  date: string;
  location: string;
  event_type: string;
  importance: string;
  demand_impact: number;
  description?: string;
}

export interface DemandScore {
  id?: number;
  hotel_id: number;
  room_type: string;
  date: string;
  occupancy_score: number;
  booking_score: number;
  weekend_score: number;
  festival_score: number;
  event_score: number;
  weather_score: number;
  season_score: number;
  total_demand_score: number;
  demand_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  breakdown?: Record<string, number>;
}

export interface PricingRecommendation {
  id: number;
  room_id: number;
  room_number?: string;
  room_type?: string;
  date: string;
  base_price: number;
  current_price?: number;
  demand_multiplier: number;
  occupancy_multiplier: number;
  weekend_multiplier: number;
  festival_multiplier: number;
  weather_multiplier: number;
  event_multiplier: number;
  lead_time_multiplier: number;
  competitor_multiplier: number;
  final_recommended_price: number;
  explanation: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Applied';
  created_at: string;
}

export interface PriceHistory {
  id: number;
  room_id: number;
  room_number?: string;
  room_type?: string;
  old_price: number;
  new_price: number;
  reason: string;
  changed_by: string;
  changed_at: string;
}

export interface CompetitorPrice {
  id: number;
  competitor_name: string;
  hotel_id: number;
  room_type: string;
  date: string;
  competitor_price: number;
  created_at: string;
}

export interface PricingRule {
  id: number;
  hotel_id: number;
  min_price_pct: number;
  max_price_pct: number;
  max_daily_change_pct: number;
  auto_pricing_enabled: boolean;
  weight_occupancy: number;
  weight_recent_bookings: number;
  weight_festival: number;
  weight_weekend: number;
  weight_event: number;
  weight_season: number;
  weight_weather: number;
  weekend_fri_pct: number;
  weekend_sat_pct: number;
  weekend_sun_pct: number;
  festival_normal_pct: number;
  festival_medium_pct: number;
  festival_major_pct: number;
  festival_peak_pct: number;
  event_low_pct: number;
  event_medium_pct: number;
  event_high_pct: number;
  event_very_high_pct: number;
  lead_time_0_1_pct: number;
  lead_time_2_6_pct: number;
  lead_time_7_14_pct: number;
  lead_time_15_29_pct: number;
  avail_under_10_pct: number;
  avail_10_30_pct: number;
  avail_30_50_pct: number;
}

export interface AdjustmentDetail {
  factor: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface SimulationResult {
  base_price: number;
  current_price: number;
  demand_score: number;
  demand_level: string;
  demand_breakdown: Record<string, number>;
  adjustments: AdjustmentDetail[];
  total_multiplier: number;
  raw_recommended_price: number;
  final_recommended_price: number;
  price_change_pct: number;
  applied_limit?: string;
  explanation: string;
}

export interface DashboardKPIs {
  today_bookings: number;
  today_revenue: number;
  occupancy_rate: number;
  rooms_occupied: number;
  rooms_available: number;
  total_rooms: number;
  adr: number;
  revpar: number;
  demand_score: number;
  demand_level: string;
  pending_recommendations: number;
}

export interface RevenueComparison {
  fixed_revenue: number;
  dynamic_revenue: number;
  difference: number;
  uplift_pct: number;
  booking_count: number;
  disclaimer: string;
}
