import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { DemoBanner } from '../components/DemoBanner';
import { useAuth } from '../context/AuthContext';
import { Hotel, Search, BookmarkCheck, ArrowRightLeft, ShieldCheck, Phone, MapPin } from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <DemoBanner />

      {/* Customer Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/customer" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Smart<span className="text-brand-600">Stay</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                  Guest Portal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> Jaipur, Rajasthan</span>
                <span>&bull;</span>
                <span className="text-amber-600 font-semibold">★ 4.8 Luxury Heritage</span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/customer"
              className={`text-xs font-bold transition ${
                location.pathname === '/customer' ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/customer/search"
              className={`text-xs font-bold transition flex items-center gap-1.5 ${
                location.pathname.startsWith('/customer/search') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Book Rooms
            </Link>
            <Link
              to="/customer/my-bookings"
              className={`text-xs font-bold transition flex items-center gap-1.5 ${
                location.pathname === '/customer/my-bookings' ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              My Bookings
            </Link>
          </nav>

          {/* Switch to Admin Mode */}
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await switchRole('ADMIN');
                navigate('/admin');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-sm transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to Hotel Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <Outlet />
      </main>

      {/* Customer Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-xs">
              S
            </div>
            <span className="font-bold text-slate-200">The Grand Palace Heritage Resort & Spa, Jaipur</span>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-500">
            SmartStay Dynamic Hotel Pricing Platform &bull; Explainable Rule-Based Architecture (No ML)
          </div>
        </div>
      </footer>
    </div>
  );
};
