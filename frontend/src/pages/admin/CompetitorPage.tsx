import React, { useState, useEffect } from 'react';
import { Compass, TrendingDown, TrendingUp, Building, ArrowUpRight, DollarSign } from 'lucide-react';
import { competitorApi } from '../../services/api';

export const CompetitorPage: React.FC = () => {
  const [summary, setSummary] = useState<any | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Deluxe');

  const fetchSummary = async () => {
    try {
      const res = await competitorApi.getSummary({ room_type: selectedRoomType });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedRoomType]);

  const ourPrice = summary?.our_price ?? 4500;
  const compAvg = summary?.competitor_average ?? 4800;
  const diff = summary?.difference ?? -300;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Competitor Benchmark Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Market rate intelligence comparing our dynamic rates with primary local competitors.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['Standard', 'Deluxe', 'Premium', 'Suite'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedRoomType(t)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedRoomType === t ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Our Selling Price ({selectedRoomType})</span>
          <div className="text-3xl font-black text-brand-600 mt-1">
            ₹{ourPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Dynamic rate in effect</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor Average</span>
          <div className="text-3xl font-black text-slate-800 mt-1">
            ₹{compAvg.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Across 3 benchmark properties</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competitive Positioning</span>
          <div className={`text-2xl font-extrabold mt-1 ${diff <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {diff <= 0 ? `₹${Math.abs(diff).toLocaleString('en-IN')} Cheaper` : `₹${diff.toLocaleString('en-IN')} Premium`}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {diff <= 0 ? 'High booking conversion advantage' : 'High luxury margin capture'}
          </span>
        </div>
      </div>

      {/* Competitor Breakdown List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Local Competitor Rate Benchmark</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {summary?.competitors?.map((c: any, i: number) => {
            const cDiff = ourPrice - c.price;
            return (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                    <span className="text-[11px] text-slate-400">Jaipur Luxury Hotel Comp Set</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Their Rate</span>
                    <span className="font-bold text-slate-800 text-sm">₹{c.price.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-right w-24">
                    <span className="text-slate-400 block text-[10px]">Our Difference</span>
                    <span className={`font-extrabold ${cDiff <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {cDiff <= 0 ? `-₹${Math.abs(cDiff).toLocaleString('en-IN')}` : `+₹${cDiff.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
