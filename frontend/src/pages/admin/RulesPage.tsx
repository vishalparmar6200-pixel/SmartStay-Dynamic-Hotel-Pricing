import React, { useState, useEffect } from 'react';
import { Settings2, Save, ShieldAlert, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';
import { pricingApi } from '../../services/api';
import { PricingRule } from '../../types';

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<PricingRule | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await pricingApi.getRules();
      setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleChange = (field: keyof PricingRule, value: any) => {
    if (!rules) return;
    setRules({ ...rules, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rules) return;
    try {
      await pricingApi.updateRules(rules);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!rules) return <div className="p-8 text-center text-xs text-slate-500">Loading pricing rules...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pricing Rule Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fine-tune business logic, guardrail thresholds, factor weights, and multipliers stored directly in PostgreSQL/SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Rules Updated & Applied!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {/* Mode Switch & Safety Boundaries Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pricing Execution Mode</h3>
            <p className="text-xs text-slate-500">Choose between manual admin verification or automated dynamic repricing</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {rules.auto_pricing_enabled ? 'Automatic Mode (Self-Applying)' : 'Manual Approval Mode'}
            </span>
            <input
              type="checkbox"
              checked={rules.auto_pricing_enabled}
              onChange={(e) => handleChange('auto_pricing_enabled', e.target.checked)}
              className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Safety Guardrail Limits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block font-bold text-slate-700 mb-1">Minimum Price Floor (% of Base)</label>
              <input
                type="number"
                value={rules.min_price_pct}
                onChange={(e) => handleChange('min_price_pct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 70% (Prevents underpricing)</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block font-bold text-slate-700 mb-1">Maximum Price Ceiling (% of Base)</label>
              <input
                type="number"
                value={rules.max_price_pct}
                onChange={(e) => handleChange('max_price_pct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 200% (Prevents extreme gouging)</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block font-bold text-slate-700 mb-1">Max Daily Price Swing (±%)</label>
              <input
                type="number"
                value={rules.max_daily_change_pct}
                onChange={(e) => handleChange('max_daily_change_pct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 20% (Prevents sudden jarring jumps)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demand Score Weight Sliders */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Demand Score Weights (Total 100%)</h3>
            <p className="text-xs text-slate-500">Adjust the relative weight of each factor in the 0-100 demand engine</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Total: {rules.weight_occupancy + rules.weight_recent_bookings + rules.weight_festival + rules.weight_weekend + rules.weight_event + rules.weight_season + rules.weight_weather}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Occupancy Weight:</span>
              <span className="text-brand-600">{rules.weight_occupancy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={rules.weight_occupancy}
              onChange={(e) => handleChange('weight_occupancy', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Recent Bookings Weight:</span>
              <span className="text-brand-600">{rules.weight_recent_bookings}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={rules.weight_recent_bookings}
              onChange={(e) => handleChange('weight_recent_bookings', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Festival Calendar Weight:</span>
              <span className="text-brand-600">{rules.weight_festival}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={rules.weight_festival}
              onChange={(e) => handleChange('weight_festival', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Weekend Impact Weight:</span>
              <span className="text-brand-600">{rules.weight_weekend}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={rules.weight_weekend}
              onChange={(e) => handleChange('weight_weekend', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Local Event Weight:</span>
              <span className="text-brand-600">{rules.weight_event}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={rules.weight_event}
              onChange={(e) => handleChange('weight_event', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Seasonality Weight:</span>
              <span className="text-brand-600">{rules.weight_season}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={rules.weight_season}
              onChange={(e) => handleChange('weight_season', Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Multiplier Specific Rules */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Rule Factor Multipliers (% Rate Adjustment)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Friday Surge (%)</label>
            <input
              type="number"
              value={rules.weekend_fri_pct}
              onChange={(e) => handleChange('weekend_fri_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Saturday Peak (%)</label>
            <input
              type="number"
              value={rules.weekend_sat_pct}
              onChange={(e) => handleChange('weekend_sat_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sunday Leisure (%)</label>
            <input
              type="number"
              value={rules.weekend_sun_pct}
              onChange={(e) => handleChange('weekend_sun_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-100">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead Time &le; 1 Day (%)</label>
            <input
              type="number"
              value={rules.lead_time_0_1_pct}
              onChange={(e) => handleChange('lead_time_0_1_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead Time 2-6 Days (%)</label>
            <input
              type="number"
              value={rules.lead_time_2_6_pct}
              onChange={(e) => handleChange('lead_time_2_6_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead Time 7-14 Days (%)</label>
            <input
              type="number"
              value={rules.lead_time_7_14_pct}
              onChange={(e) => handleChange('lead_time_7_14_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Availability &lt; 10% (%)</label>
            <input
              type="number"
              value={rules.avail_under_10_pct}
              onChange={(e) => handleChange('avail_under_10_pct', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
