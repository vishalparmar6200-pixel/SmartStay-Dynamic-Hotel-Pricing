import React from 'react';
import { PricingRecommendation } from '../types';
import { X, CheckCircle, XCircle, Info, ShieldCheck, TrendingUp } from 'lucide-react';

interface PriceBreakdownModalProps {
  rec: PricingRecommendation | null;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  rec,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!rec) return null;

  const multipliers = [
    { label: 'Occupancy Rate Adjustment', mult: rec.occupancy_multiplier, factor: 'Occupancy' },
    { label: 'Weekend Surge Premium', mult: rec.weekend_multiplier, factor: 'Weekend' },
    { label: 'Festival / Holiday Impact', mult: rec.festival_multiplier, factor: 'Festival' },
    { label: 'Local Event Demand', mult: rec.event_multiplier, factor: 'Event' },
    { label: 'Weather Impact Factor', mult: rec.weather_multiplier, factor: 'Weather' },
    { label: 'Booking Lead Time Factor', mult: rec.lead_time_multiplier, factor: 'Lead Time' },
    { label: 'Competitor Rate Alignment', mult: rec.competitor_multiplier, factor: 'Competitor' },
  ].filter((m) => m.mult !== 1.0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Price Recommendation Audit</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Explainable AI-Free
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Room {rec.room_number} ({rec.room_type}) &bull; Date: {rec.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Comparison Hero */}
        <div className="grid grid-cols-2 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Base Price</span>
            <div className="text-xl font-bold text-slate-600 mt-0.5">₹{rec.base_price.toLocaleString('en-IN')}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs text-brand-600 font-semibold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Recommended Price
            </span>
            <div className="text-2xl font-black text-brand-600 mt-0.5">
              ₹{rec.final_recommended_price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Breakdown of Rule Multipliers */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Active Factor Multipliers
          </div>
          {multipliers.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No specific surge multipliers applied (standard rate).</p>
          ) : (
            multipliers.map((m, idx) => {
              const pct = ((m.mult - 1.0) * 100).toFixed(0);
              const isPos = m.mult >= 1.0;
              const amount = rec.base_price * (m.mult - 1.0);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50/80 border border-slate-100"
                >
                  <span className="font-medium text-slate-700">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isPos ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isPos ? `+${pct}%` : `${pct}%`}
                    </span>
                    <span className="font-semibold text-slate-900 w-16 text-right">
                      {isPos ? `+₹${Math.round(amount)}` : `-₹${Math.round(Math.abs(amount))}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Explainability box */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3.5 mb-6">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-900 block mb-0.5">Rule Engine Explanation:</span>
              <p className="text-xs text-amber-900/90 leading-relaxed italic">
                "{rec.explanation}"
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          {rec.status === 'Pending' && onReject && (
            <button
              onClick={() => {
                onReject(rec.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          )}
          {rec.status === 'Pending' && onApprove && (
            <button
              onClick={() => {
                onApprove(rec.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/30"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Apply Price
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
