import axios from 'axios';
import {
  User, Hotel, Room, Booking, OccupancyRecord, WeatherRecord,
  FestivalEvent, DemandScore, PricingRecommendation, PriceHistory,
  CompetitorPrice, PricingRule, SimulationResult, DashboardKPIs, RevenueComparison
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for attaching auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartstay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', data),
  register: (data: any) => api.post<User>('/auth/register', data),
  getMe: () => api.get<User>('/auth/me'),
};

export const hotelsApi = {
  getAll: () => api.get<Hotel[]>('/hotels'),
  getById: (id: number) => api.get<Hotel>(`/hotels/${id}`),
  update: (id: number, data: any) => api.put<Hotel>(`/hotels/${id}`, data),
};

export const roomsApi = {
  getAll: (params?: { hotel_id?: number; room_type?: string; status?: string }) =>
    api.get<Room[]>('/rooms', { params }),
  getById: (id: number) => api.get<Room>(`/rooms/${id}`),
  create: (data: any) => api.post<Room>('/rooms', data),
  update: (id: number, data: any) => api.put<Room>(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
  overridePrice: (id: number, data: { new_price: number; reason: string }) =>
    api.post<Room>(`/rooms/${id}/override-price`, data),
};

export const bookingsApi = {
  getAll: (params?: { hotel_id?: number; customer_id?: number; status?: string }) =>
    api.get<Booking[]>('/bookings', { params }),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),
  create: (data: any) => api.post<Booking>('/bookings', data),
  cancel: (id: number) => api.post<Booking>(`/bookings/${id}/cancel`),
};

export const occupancyApi = {
  getAll: (params?: { hotel_id?: number; room_type?: string; start_date?: string; end_date?: string }) =>
    api.get<OccupancyRecord[]>('/occupancy', { params }),
  getByDate: (date: string, hotel_id?: number) =>
    api.get<any>(`/occupancy/${date}`, { params: { hotel_id } }),
};

export const weatherApi = {
  getForecast: (params?: { location?: string; days?: number }) =>
    api.get<WeatherRecord[]>('/weather', { params }),
};

export const eventsApi = {
  getAll: (params?: { event_type?: string; from_date?: string; to_date?: string }) =>
    api.get<FestivalEvent[]>('/events', { params }),
  create: (data: any) => api.post<FestivalEvent>('/events', data),
  update: (id: number, data: any) => api.put<FestivalEvent>(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

export const demandApi = {
  calculate: (params: any) => api.get<any>('/demand/calculate', { params }),
  getToday: (hotel_id?: number) => api.get<any[]>('/demand/today', { params: { hotel_id } }),
  getHistory: (params?: { hotel_id?: number; limit?: number }) =>
    api.get<DemandScore[]>('/demand/history', { params }),
};

export const pricingApi = {
  getRecommendations: (params?: { hotel_id?: number; status?: string }) =>
    api.get<PricingRecommendation[]>('/pricing/recommendations', { params }),
  approve: (id: number, custom_price?: number) =>
    api.post(`/pricing/recommendations/${id}/approve`, { custom_price }),
  reject: (id: number) =>
    api.post(`/pricing/recommendations/${id}/reject`),
  apply: (id: number, custom_price: number) =>
    api.post(`/pricing/recommendations/${id}/apply`, { custom_price }),
  recalculateAll: (hotel_id?: number) =>
    api.post('/pricing/recalculate-all', null, { params: { hotel_id } }),
  getHistory: (params?: { room_id?: number; hotel_id?: number; limit?: number }) =>
    api.get<PriceHistory[]>('/pricing/history', { params }),
  getRules: (hotel_id?: number) =>
    api.get<PricingRule>('/pricing/rules', { params: { hotel_id } }),
  updateRules: (data: any, hotel_id?: number) =>
    api.put<PricingRule>('/pricing/rules', data, { params: { hotel_id } }),
  simulate: (data: any) =>
    api.post<SimulationResult>('/pricing/simulate', data),
};

export const competitorApi = {
  getAll: (params?: { hotel_id?: number; room_type?: string; date?: string }) =>
    api.get<CompetitorPrice[]>('/competitor', { params }),
  getSummary: (params?: { hotel_id?: number; room_type?: string; date?: string }) =>
    api.get<any>('/competitor/summary', { params }),
  create: (data: any) => api.post<CompetitorPrice>('/competitor', data),
};

export const analyticsApi = {
  getKpis: (hotel_id?: number) => api.get<DashboardKPIs>('/analytics/kpis', { params: { hotel_id } }),
  getFixedVsDynamic: (hotel_id?: number) => api.get<RevenueComparison>('/analytics/fixed-vs-dynamic', { params: { hotel_id } }),
  getTrends: (params?: { hotel_id?: number; days?: number }) => api.get<any[]>('/analytics/trends', { params }),
  getRoomTypes: (hotel_id?: number) => api.get<any[]>('/analytics/room-types', { params: { hotel_id } }),
};

export const systemApi = {
  getCredentials: () => api.get<any>('/system/demo-credentials'),
};

export default api;
