import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, Sparkles, TrendingUp, ShieldCheck,
  RotateCcw, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { pricingApi } from '../../services/api';
import { SimulationResult } from '../../types';
import { DemandBadge } from '../../components/DemandBadge';

export const SimulatorPage: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(3000);
  const [currentPrice, setCurrentPrice] = useState<number>(3000);
  const [occupancyRate, setOccupancyRate] = useState<number>(85);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Saturday');
  const [isWeekend, setIsWeekend] = useState<boolean>(true);
  const [festivalType, setFestivalType] = useState<string>('Major');
  const [festivalName, setFestivalName] = useState<string>('Diwali Festival');
  const [eventType, setEventType] = useState<string>('High');
  const [eventName, setEventName] = useState<string>('Heritage Conference');
  const [weatherCondition, setWeatherCondition] = useState<string>('Good');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [roomsAvailablePct, setRoomsAvailablePct] = useState<number>(15);
  const [competitorPrice, setCompetitorPrice] = useState<number>(4800);
  const [enforceDailyCap, setEnforceDailyCap] = useState<boolean>(false);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await pricingApi.simulate({
        base_price: basePrice,
        current_price: currentPrice,
        occupancy_rate: occupancyRate,
        is_weekend: isWeekend,
        day_of_week: dayOfWeek,
        festival_type: festivalType,
        festival_name: festivalType !== 'None' ? festivalName : undefined,
        event_type: eventType,
        event_name: eventType !== 'None' ? eventName : undefined,
        weather_condition: weatherCondition,
        lead_time_days: leadTimeDays,
        rooms_available_pct: roomsAvailablePct,
        competitor_price: competitorPrice > 0 ? competitorPrice : undefined,
        enforce_daily_cap: enforceDailyCap
      });
      setResult(res.data);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [
    basePrice, currentPrice, occupancyRate, dayOfWeek, isWeekend,
    festivalType, festivalName, eventType, eventName, weatherCondition,
    leadTimeDays, roomsAvailablePct, competitorPrice, enforceDailyCap
  ]);

  const resetToBaseline = () => {
    setBasePrice(3000);
    setCurrentPrice(3000);
    setOccupancyRate(50);
    setDayOfWeek('Wednesday');
    setIsWeekend(false);
    setFestivalType('None');
    setEventType('None');
    setWeatherCondition('Normal');
    setLeadTimeDays(14);
    setRoomsAvailablePct(50);
    setCompetitorPrice(3200);
    setEnforceDailyCap(true);
  };

  const applyDemoScenario = () => {
    // Step 7 internship scenario: Occupancy 85%, Weekend YES, Festival YES, Event YES, Weather GOOD, Lead time 3 days
    setBasePrice(3000);
    setCurrentPrice(3000);
    setOccupancyRate(85);
    setDayOfWeek('Saturday');
    setIsWeekend(true);
    setFestivalType('Major');
    setFestivalName('Diwali Festival');
    setEventType('High');
    setEventName('Medical Conference');
    setWeatherCondition('Good');
    setLeadTimeDays(3);
    setRoomsAvailablePct(15);
    setCompetitorPrice(4800);
    setEnforceDailyCap(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Price Simulator</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Real-Time What-If Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate how business rules react instantly to market forces, occupancy changes, festivals, and weather.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToBaseline}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
          <button
            onClick={applyDemoScenario}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Demo Peak Scenario</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Sliders & Controls */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Simulated Market Parameters
          </h3>

          {/* Base & Current Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Room Price (₹)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Selling Price (₹)</label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Occupancy Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700">Hotel Occupancy Rate:</span>
              <span className="font-extrabold text-brand-600 text-sm">{occupancyRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={occupancyRate}
              onChange={(e) => setOccupancyRate(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>0% (Empty)</span>
              <span>30% (Low)</span>
              <span>60% (Moderate)</span>
              <span>80% (High)</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* Weekend and Day of Week */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => {
                  setDayOfWeek(e.target.value);
                  setIsWeekend(['Friday', 'Saturday', 'Sunday'].includes(e.target.value));
                }}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="Monday">Monday (Weekday)</option>
                <option value="Tuesday">Tuesday (Weekday)</option>
                <option value="Wednesday">Wednesday (Weekday)</option>
                <option value="Thursday">Thursday (Weekday)</option>
                <option value="Friday">Friday (+5% surge)</option>
                <option value="Saturday">Saturday (+10% peak)</option>
                <option value="Sunday">Sunday (+5% surge)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weather Condition</label>
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="Excellent">Excellent (+5%)</option>
                <option value="Good">Good (+2%)</option>
                <option value="Normal">Normal (0%)</option>
                <option value="Rain">Rain (-5%)</option>
                <option value="Heavy Rain">Heavy Rain (-10%)</option>
                <option value="Extreme">Extreme Weather (-15%)</option>
              </select>
            </div>
          </div>

          {/* Festivals and Events */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Festival Impact Level</label>
              <select
                value={festivalType}
                onChange={(e) => setFestivalType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="None">None (0%)</option>
                <option value="Normal">Normal Holiday (+10%)</option>
                <option value="Medium">Medium Festival (+15%)</option>
                <option value="Major">Major Festival (+25% Diwali/Holi)</option>
                <option value="Peak">Peak Festival (+35% New Year)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Event Scale</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value="None">None (0%)</option>
                <option value="Low">Low Impact (+5%)</option>
                <option value="Medium">Medium Event (+10%)</option>
                <option value="High">High Event (+20% Conference)</option>
                <option value="Very High">Very High (+30% IPL/Mega)</option>
              </select>
            </div>
          </div>

          {/* Booking Lead Time & Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold text-slate-700">
                <span>Booking Lead Time:</span>
                <span className="text-brand-600">{leadTimeDays} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                {leadTimeDays <= 1 ? 'Last-minute (+20%)' : leadTimeDays <= 6 ? 'Short notice (+15%)' : 'Standard'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Competitor Benchmark (₹)</label>
              <input
                type="number"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          {/* Safety Checkbox */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="dailyCap"
              checked={enforceDailyCap}
              onChange={(e) => setEnforceDailyCap(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="dailyCap" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Enforce ±20% Maximum Daily Change Safeguard Limit
            </label>
          </div>
        </div>

        {/* Right Column: Instant Dynamic Pricing Engine Output */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Recommended Price Card */}
          <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white p-6 rounded-2xl border border-brand-800/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rule Engine Output
              </span>
              {result && (
                <DemandBadge level={result.demand_level} score={result.demand_score} size="sm" />
              )}
            </div>

            <div className="mt-5">
              <span className="text-xs text-slate-300">Recommended Optimal Room Price</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-black text-white tracking-tight">
                  ₹{result ? result.final_recommended_price.toLocaleString('en-IN') : '...'}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ night</span>
              </div>
            </div>

            {result && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Net Multiplier</span>
                  <span className="font-extrabold text-brand-300">
                    {result.total_multiplier}x
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Price Delta vs Current</span>
                  <span
                    className={`font-extrabold ${
                      result.price_change_pct >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {result.price_change_pct >= 0 ? `+${result.price_change_pct}%` : `${result.price_change_pct}%`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Base Price</span>
                  <span className="font-semibold text-slate-300">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {result?.applied_limit && (
              <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-200">
                Guardrail Limit: {result.applied_limit}
              </div>
            )}
          </div>

          {/* Natural Language Explanation Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                  Explainability Rationale:
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed italic">
                  "{result?.explanation || 'Calculating pricing rationale...'}"
                </p>
              </div>
            </div>
          </div>

          {/* Factor Breakdown Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Factor Adjustment Breakdown
            </h4>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {result?.adjustments.map((adj, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">{adj.factor}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        adj.percentage >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {adj.percentage >= 0 ? `+${adj.percentage}%` : `${adj.percentage}%`}
                    </span>
                    <span className="font-bold text-slate-900 w-16 text-right">
                      {adj.amount >= 0 ? `+₹${Math.round(adj.amount)}` : `-₹${Math.round(Math.abs(adj.amount))}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
