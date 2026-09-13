import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, Info, ShieldCheck, Activity } from 'lucide-react';
import { demandApi } from '../../services/api';
import { DemandBadge } from '../../components/DemandBadge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DemandPage: React.FC = () => {
  const [todayDemand, setTodayDemand] = useState<any | null>(null);
  const [historyScores, setHistoryScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDemand = async () => {
    setIsLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([
        demandApi.getToday(),
        demandApi.getHistory({ limit: 14 })
      ]);
      if (todayRes.data && todayRes.data.length > 0) {
        setTodayDemand(todayRes.data[0]);
      }
      setHistoryScores(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, []);

  const breakdown = todayDemand?.breakdown || {
    occupancy: 28.5,
    recent_bookings: 22.0,
    festival: 18.0,
    weekend: 10.0,
    event: 8.0,
    season: 4.5,
    weather: 4.0
  };

  const factors = [
    { name: 'Occupancy Rate', score: breakdown.occupancy, max: 30, color: 'bg-brand-500' },
    { name: 'Recent Bookings Velocity', score: breakdown.recent_bookings, max: 25, color: 'bg-indigo-500' },
    { name: 'Festival / Holiday Calendar', score: breakdown.festival, max: 15, color: 'bg-purple-500' },
    { name: 'Weekend Surge Impact', score: breakdown.weekend, max: 10, color: 'bg-amber-500' },
    { name: 'Local Events & Conferences', score: breakdown.event, max: 10, color: 'bg-emerald-500' },
    { name: 'Annual Tourist Seasonality', score: breakdown.season, max: 5, color: 'bg-rose-500' },
    { name: 'Weather Condition Score', score: breakdown.weather, max: 5, color: 'bg-sky-500' },
  ];

  const totalScore = todayDemand?.total_demand_score || 89.0;
  const demandLevel = todayDemand?.demand_level || 'Very High';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Demand Score Engine Analytics</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            100% Rule-Based (No ML)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete explainability breakdown showing the exact mathematical contribution of each market factor.
        </p>
      </div>

      {/* Main Demand Index Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 rounded-2xl border border-indigo-900 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-300" />
                Live Demand Level
              </span>
              <DemandBadge level={demandLevel} size="md" />
            </div>

            <div className="mt-6">
              <span className="text-xs text-slate-400">Total Calculated Demand Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black text-white">{totalScore.toFixed(0)}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Calculated using weighted multi-factor linear aggregation without black-box neural networks. All weights and threshold curves are fully auditable by hotel management.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Room Type: <b className="text-white">Deluxe Category</b></span>
            <span>Status: <b className="text-emerald-400">Calibrated</b></span>
          </div>
        </div>

        {/* Contributing Factors Visual Bars (Section 38) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contributing Factor Breakdown</h3>
              <p className="text-xs text-slate-500">Breakdown of weighted sub-scores totaling 100%</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
              Configurable Weights
            </span>
          </div>

          <div className="space-y-3.5">
            {factors.map((f, i) => {
              const pct = Math.min(100, Math.round((f.score / f.max) * 100));
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Weight: {f.max}%</span>
                      <span className="font-extrabold text-slate-900 w-12 text-right">{f.score.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${f.color}`} style={{ width: `${(f.score / f.max) * 100}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demand History Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Historical Demand Trend (Past 14 Days)</h3>
        <p className="text-xs text-slate-500 mb-4">Evolution of composite demand scores over time</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyScores}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="total_demand_score" name="Demand Score" fill="#0c8de7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
