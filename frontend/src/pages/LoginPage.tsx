import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, ShieldCheck, KeyRound, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@smartstay.com');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } else {
      setError("Invalid credentials. Try using the 1-Click Demo buttons below.");
    }
  };

  const fillAdmin = () => {
    setEmail('admin@smartstay.com');
    setPassword('admin123');
  };

  const fillCustomer = () => {
    setEmail('customer@smartstay.com');
    setPassword('customer123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6 border border-slate-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30">
            <Hotel className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">SmartStay Login</h2>
          <p className="text-xs text-slate-500">
            Dynamic Hotel Pricing & Revenue Optimization System
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
          </button>
        </form>

        {/* 1-Click Fast Demo Credentials Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            1-Click Demo Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillAdmin}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition text-center"
            >
              Fill Hotel Admin
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition text-center"
            >
              Fill Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
