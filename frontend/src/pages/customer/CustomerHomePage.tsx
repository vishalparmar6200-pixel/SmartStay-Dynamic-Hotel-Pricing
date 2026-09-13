import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, Star, ShieldCheck, MapPin, Sparkles, Coffee, Wifi, Waves, Utensils } from 'lucide-react';

export const CustomerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(today);
  const [checkOut, setCheckOut] = useState<string>(tomorrow);
  const [guests, setGuests] = useState<number>(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/customer/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 md:p-14 shadow-2xl border border-indigo-900/40">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Royal Rajputana Heritage Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            The Grand Palace Heritage Resort & Spa
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Experience timeless luxury nestled along the majestic foothills of Amer in Jaipur. Enjoy real-time transparent rate guarantees calibrated to seasonal demand.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-400" /> Jaipur, Rajasthan</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3.5 h-3.5 fill-current" /> 4.8 / 5 (1,240 Reviews)</span>
          </div>
        </div>

        {/* Search Booking Widget Box */}
        <div className="mt-8 bg-white/95 backdrop-blur-md rounded-2xl p-5 text-slate-900 shadow-xl border border-white/40">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                Number of Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults (Family)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Available Rooms</span>
            </button>
          </form>
        </div>
      </div>

      {/* Highlights & Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Wifi, title: "High-Speed WiFi", desc: "Complimentary across resort" },
          { icon: Waves, title: "Royal Swimming Pool", desc: "Temperature controlled" },
          { icon: Utensils, title: "Rajputana Dining", desc: "Authentic fine dining" },
          { icon: Coffee, title: "Artisan Breakfast", desc: "Buffet & courtyard dining" },
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{feat.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
