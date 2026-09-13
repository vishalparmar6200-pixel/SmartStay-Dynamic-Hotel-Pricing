import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, SlidersHorizontal, TrendingUp, BedDouble,
  CalendarCheck, CalendarDays, BarChart3, History,
  PartyPopper, CalendarRange, CloudSun, Compass,
  LineChart, Settings2, Sliders
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Price Simulator', path: '/admin/simulator', icon: SlidersHorizontal, badge: 'Interactive', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { label: 'Pricing Recommendations', path: '/admin/recommendations', icon: TrendingUp, badge: 'Active', badgeColor: 'bg-amber-100 text-amber-800' },
  { label: 'Room Inventory', path: '/admin/rooms', icon: BedDouble },
  { label: 'Bookings Manager', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Occupancy Matrix', path: '/admin/occupancy', icon: CalendarDays },
  { label: 'Demand Analytics', path: '/admin/demand', icon: BarChart3 },
  { label: 'Price History', path: '/admin/price-history', icon: History },
  { label: 'Festivals & Holidays', path: '/admin/festivals', icon: PartyPopper },
  { label: 'Local Events', path: '/admin/events', icon: CalendarRange },
  { label: 'Weather Forecast', path: '/admin/weather', icon: CloudSun },
  { label: 'Competitor Benchmark', path: '/admin/competitors', icon: Compass },
  { label: 'Revenue Analytics', path: '/admin/revenue', icon: LineChart, badge: '+14.3%', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { label: 'Pricing Rules Config', path: '/admin/rules', icon: Settings2 },
  { label: 'System Settings', path: '/admin/settings', icon: Sliders },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-65px)] sticky top-[65px] select-none">
      <div className="p-4 border-b border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Revenue Management
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Engine Status</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </span>
        </div>
      </div>
    </aside>
  );
};
