import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout';

// Admin Pages
import { DashboardPage } from './pages/admin/DashboardPage';
import { SimulatorPage } from './pages/admin/SimulatorPage';
import { RecommendationsPage } from './pages/admin/RecommendationsPage';
import { RoomsPage } from './pages/admin/RoomsPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { OccupancyPage } from './pages/admin/OccupancyPage';
import { DemandPage } from './pages/admin/DemandPage';
import { PriceHistoryPage } from './pages/admin/PriceHistoryPage';
import { FestivalsPage } from './pages/admin/FestivalsPage';
import { EventsPage } from './pages/admin/EventsPage';
import { WeatherPage } from './pages/admin/WeatherPage';
import { CompetitorPage } from './pages/admin/CompetitorPage';
import { RevenuePage } from './pages/admin/RevenuePage';
import { RulesPage } from './pages/admin/RulesPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Customer Pages
import { CustomerHomePage } from './pages/customer/CustomerHomePage';
import { RoomSearchPage } from './pages/customer/RoomSearchPage';
import { BookingCheckoutPage } from './pages/customer/BookingCheckoutPage';
import { BookingConfirmationPage } from './pages/customer/BookingConfirmationPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';

// Auth Page
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Hotel Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="occupancy" element={<OccupancyPage />} />
            <Route path="demand" element={<DemandPage />} />
            <Route path="price-history" element={<PriceHistoryPage />} />
            <Route path="festivals" element={<FestivalsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="competitors" element={<CompetitorPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Customer Portal */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHomePage />} />
            <Route path="search" element={<RoomSearchPage />} />
            <Route path="checkout" element={<BookingCheckoutPage />} />
            <Route path="confirmation/:id" element={<BookingConfirmationPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
          </Route>

          {/* Root redirect to Customer Portal or Admin */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<CustomerHomePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
