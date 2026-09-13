import React, { useState, useEffect } from 'react';
import {
  TrendingUp, CheckCircle, XCircle, Filter,
  RefreshCw, Info, ExternalLink, ShieldAlert
} from 'lucide-react';
import { pricingApi } from '../../services/api';
import { PricingRecommendation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { PriceBreakdownModal } from '../../components/PriceBreakdownModal';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedRec, setSelectedRec] = useState<PricingRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await pricingApi.getRecommendations({
        status: filterStatus === 'All' ? undefined : filterStatus
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filterStatus]);

  const handleApprove = async (id: number) => {
    try {
      await pricingApi.approve(id);
      setActionSuccess(`Recommendation #${id} approved! Room price updated in inventory.`);
      await fetchRecommendations();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await pricingApi.reject(id);
      setActionSuccess(`Recommendation #${id} rejected.`);
      await fetchRecommendations();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pricing Recommendations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Transparent algorithmic rate suggestions generated from real-time occupancy, calendar, and weather factors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['All', 'Pending', 'Approved', 'Applied', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-900 hover:text-emerald-950 font-bold">&times;</button>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Room</th>
                <th className="px-4 py-3">Room Type</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-4 py-3">Base Rate</th>
                <th className="px-4 py-3">Current Rate</th>
                <th className="px-4 py-3">Recommended</th>
                <th className="px-4 py-3">Multiplier</th>
                <th className="px-5 py-3">Main Explanation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recommendations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400 italic">
                    No recommendations found matching filter '{filterStatus}'.
                  </td>
                </tr>
              ) : (
                recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">{rec.room_number}</td>
                    <td className="px-4 py-3.5">{rec.room_type}</td>
                    <td className="px-4 py-3.5 text-slate-500">{rec.date}</td>
                    <td className="px-4 py-3.5 text-slate-500">₹{rec.base_price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-slate-700">₹{(rec.current_price || rec.base_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 font-extrabold text-brand-600 text-sm">
                      ₹{rec.final_recommended_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">
                      {rec.demand_multiplier}x
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-600">
                      {rec.explanation}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedRec(rec)}
                        className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      {rec.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleReject(rec.id)}
                            className="px-2.5 py-1 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(rec.id)}
                            className="px-3 py-1 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-xs font-bold shadow-sm"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PriceBreakdownModal
        rec={selectedRec}
        onClose={() => setSelectedRec(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
