import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, User, ArrowRightLeft, ShieldCheck, Sparkles, LogOut, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Hotel className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Smart<span className="text-brand-600">Stay</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Rule-Based (No ML)
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">Dynamic Pricing & Revenue Optimization System</p>
        </div>
      </div>

      {/* Role Switcher & User profile */}
      <div className="flex items-center gap-3">
        {/* Fast Switch Role Button */}
        <button
          onClick={() => {
            const nextRole = isAdmin ? 'CUSTOMER' : 'ADMIN';
            switchRole(nextRole);
            navigate(nextRole === 'ADMIN' ? '/admin' : '/');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-sm ${
            isAdmin
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
          }`}
          title="Toggle between Hotel Admin and Customer mode instantly"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Switch to {isAdmin ? 'Customer Portal' : 'Admin Console'}</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
