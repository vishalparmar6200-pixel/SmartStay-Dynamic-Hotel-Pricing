import React, { useState } from 'react';
import { Sliders, ShieldCheck, Database, KeyRound, Hotel, RefreshCw, CheckCircle2 } from 'lucide-react';
import { pricingApi } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const [resetting, setResetting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRecalculate = async () => {
    setResetting(true);
    try {
      await pricingApi.recalculateAll();
      setSuccessMsg("Dynamic Pricing Engine ran full sweep across all hotel room inventory.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System & Environment Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          SmartStay operational parameters, credentials, and rule engine diagnostic controls.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hotel Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">The Grand Palace Heritage Resort & Spa</h3>
            <p className="text-xs text-slate-500">Amer Road, Near Jal Mahal, Jaipur, Rajasthan (26.9664° N, 75.8507° E)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Rooms</span>
            <span className="font-extrabold text-slate-800">24 Rooms</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Star Rating</span>
            <span className="font-extrabold text-amber-600">★ 4.8 Heritage</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Currency</span>
            <span className="font-extrabold text-slate-800">INR (₹)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Engine Type</span>
            <span className="font-extrabold text-emerald-600">Rule-Based</span>
          </div>
        </div>
      </div>

      {/* Demo Credentials Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Demonstration Login Credentials</h3>
            <p className="text-xs text-slate-500">Pre-configured accounts for evaluators and internship demonstrations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Hotel Administrator</span>
            <div className="text-slate-600 space-y-1">
              <div>Email: <code className="font-bold text-brand-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@smartstay.com</code></div>
              <div>Password: <code className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123</code></div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Hotel Customer / Guest</span>
            <div className="text-slate-600 space-y-1">
              <div>Email: <code className="font-bold text-brand-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">customer@smartstay.com</code></div>
              <div>Password: <code className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">customer123</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Engine Controls & Recalibration</h3>
        <p className="text-xs text-slate-500">
          Trigger a full pricing calculation cycle across all rooms using current occupancy, calendar, and weather observations.
        </p>

        <button
          onClick={handleRecalculate}
          disabled={resetting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Recalculating Inventory...' : 'Trigger Full Dynamic Recalibration'}</span>
        </button>
      </div>
    </div>
  );
};
