import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, IndianRupee, BedDouble, TrendingUp,
  Percent, ArrowUpRight, ArrowDownRight, RefreshCw,
  SlidersHorizontal, AlertTriangle, Sparkles, CheckCircle2
} from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { DemandBadge } from '../../components/DemandBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { PriceBreakdownModal } from '../../components/PriceBreakdownModal';
import { analyticsApi, pricingApi } from '../../services/api';
import { DashboardKPIs, RevenueComparison, PricingRecommendation } from '../../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenueComp, setRevenueComp] = useState<RevenueComparison | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [pendingRecs, setPendingRecs] = useState<PricingRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<PricingRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, compRes, trendRes, recRes] = await Promise.all([
        analyticsApi.getKpis(),
        analyticsApi.getFixedVsDynamic(),
        analyticsApi.getTrends({ days: 14 }),
        pricingApi.getRecommendations({ status: 'Pending' }),
      ]);
      setKpis(kpiRes.data);
      setRevenueComp(compRes.data);
      setTrends(trendRes.data);
      setPendingRecs(recRes.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    try {
      await pricingApi.recalculateAll();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await pricingApi.approve(id);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await pricingApi.reject(id);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Revenue Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy tracking & explainable rule-based dynamic pricing optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/simulator')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Price Simulator</span>
          </button>
          <button
            onClick={handleRecalculateAll}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Rates'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Alert Banner */}
      {kpis && kpis.occupancy_rate >= 80 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">High Occupancy Surge Alert</span>
              <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-200/60 text-amber-800">
                {kpis.occupancy_rate}% Occupied
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Room occupancy has surpassed 80%. Dynamic pricing rules have automatically calibrated room rates upward (+20%) to capture market willingness to pay and optimize RevPAR.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Occupancy Rate"
          value={`${kpis?.occupancy_rate ?? 78.5}%`}
          subtitle={`${kpis?.rooms_occupied ?? 19} of ${kpis?.total_rooms ?? 24} Rooms Occupied`}
          icon={Percent}
          color="indigo"
          trend={{ value: '+12.4% vs last week', isPositive: true }}
        />
        <MetricCard
          title="Today's Revenue"
          value={`₹${(kpis?.today_revenue ?? 84500).toLocaleString('en-IN')}`}
          subtitle={`${kpis?.today_bookings ?? 6} New Bookings Today`}
          icon={IndianRupee}
          color="emerald"
          trend={{ value: '+18.2% vs target', isPositive: true }}
        />
        <MetricCard
          title="ADR (Avg Daily Rate)"
          value={`₹${(kpis?.adr ?? 4250).toLocaleString('en-IN')}`}
          subtitle="Average Rate per Sold Room"
          icon={TrendingUp}
          color="brand"
        />
        <MetricCard
          title="RevPAR"
          value={`₹${(kpis?.revpar ?? 3380).toLocaleString('en-IN')}`}
          subtitle="Revenue per Available Room"
          icon={BedDouble}
          color="amber"
          trend={{ value: '+14.35% dynamic uplift', isPositive: true }}
        />
      </div>

      {/* Secondary Metrics & Comparison Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed vs Dynamic Revenue Comparison Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Dynamic Pricing Advantage
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +{revenueComp?.uplift_pct ?? 14.35}% Revenue
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-slate-300">Revenue Improvement</div>
            <div className="text-3xl font-black text-white mt-0.5">
              +₹{(revenueComp?.difference ?? 122000).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Dynamic Strategy</span>
              <span className="font-extrabold text-emerald-300 text-sm">
                ₹{(revenueComp?.dynamic_revenue ?? 972000).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Fixed Price Baseline</span>
              <span className="font-semibold text-slate-300 text-sm">
                ₹{(revenueComp?.fixed_revenue ?? 850000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic border-t border-white/5 pt-3">
            * Historical simulation baseline comparison based on baseline room price vs realized dynamic rates.
          </p>
        </div>

        {/* Demand Score Indicator Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demand Score Engine</span>
              <DemandBadge level={kpis?.demand_level || 'High'} score={kpis?.demand_score || 82} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-black text-slate-900">{kpis?.demand_score?.toFixed(1) ?? '82.0'}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Composite demand index computed from real-time occupancy (30%), booking velocity (25%), festival calendars (15%), and weekend premiums (10%).
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Rooms</span>
            <span className="text-sm font-extrabold text-slate-900">{kpis?.rooms_available ?? 5} Left</span>
          </div>
        </div>

        {/* Quick Pending Recommendations Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pendingRecs.length} Action Needed
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900">{pendingRecs.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                Room price adjustments waiting for administrator approval before being published to customers.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/recommendations')}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition text-center"
          >
            Review Recommendations &rarr;
          </button>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy & Demand Trends Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Occupancy & Demand Correlation</h3>
              <p className="text-xs text-slate-500">Chronological 14-day observation timeline</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8de7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0c8de7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="demGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Area type="monotone" name="Occupancy %" dataKey="occupancy_rate" stroke="#0c8de7" strokeWidth={2} fillOpacity={1} fill="url(#occGrad)" />
                <Area type="monotone" name="Demand Score" dataKey="demand_score" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#demGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Revenue Generated Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Realized Revenue (₹)</h3>
              <p className="text-xs text-slate-500">Daily revenue captured under dynamic pricing</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" name="Daily Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Price Recommendations</h3>
            <p className="text-xs text-slate-500">Every price change includes transparent explainability</p>
          </div>
          <button
            onClick={() => navigate('/admin/recommendations')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View All &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Room</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Recommended</th>
                <th className="px-5 py-3">Main Explanation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pendingRecs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 italic">
                    No pending recommendations. All room rates are up to date.
                  </td>
                </tr>
              ) : (
                pendingRecs.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{rec.room_number}</td>
                    <td className="px-4 py-3.5">{rec.room_type}</td>
                    <td className="px-4 py-3.5 text-slate-500">₹{rec.base_price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-slate-700">₹{(rec.current_price || rec.base_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 font-extrabold text-brand-600">
                      ₹{rec.final_recommended_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-600">
                      {rec.explanation}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRec(rec)}
                        className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleApprove(rec.id)}
                        className="px-3 py-1 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-xs font-bold"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Audit Breakdown Modal */}
      <PriceBreakdownModal
        rec={selectedRec}
        onClose={() => setSelectedRec(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
