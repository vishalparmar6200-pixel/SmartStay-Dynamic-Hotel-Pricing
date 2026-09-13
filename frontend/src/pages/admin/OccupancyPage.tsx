import React, { useState, useEffect } from 'react';
import { CalendarDays, Percent, BedDouble, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { occupancyApi } from '../../services/api';
import { MetricCard } from '../../components/MetricCard';

export const OccupancyPage: React.FC = () => {
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [occupancyData, setOccupancyData] = useState<any | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  const fetchDateData = async () => {
    try {
      const res = await occupancyApi.getByDate(targetDate);
      setOccupancyData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await occupancyApi.getAll();
      setHistoryRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDateData();
  }, [targetDate]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const changeDay = (delta: number) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + delta);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const overall = occupancyData?.overall;

  return (
    <div className="space-y-6">
      {/* Header with Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Occupancy Matrix & Capacity</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy rates driving demand scoring and automated scarcity pricing adjustments.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent px-2 py-1 focus:outline-none"
          />
          <button
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overall Occupancy KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          title="Overall Hotel Occupancy"
          value={`${overall?.occupancy_rate ?? 82.0}%`}
          subtitle={`On ${targetDate}`}
          icon={Percent}
          color="indigo"
        />
        <MetricCard
          title="Occupied Rooms"
          value={`${overall?.occupied_rooms ?? 19}`}
          subtitle={`Out of ${overall?.total_rooms ?? 24} total inventory`}
          icon={BedDouble}
          color="brand"
        />
        <MetricCard
          title="Available Inventory"
          value={`${overall?.available_rooms ?? 5} Rooms`}
          subtitle="Remaining capacity for date"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Breakdown by Room Type */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Room Category Capacity Breakdown ({targetDate})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {occupancyData?.room_types?.map((item: any) => {
            const occ = item.occupancy_rate;
            let barColor = 'bg-brand-500';
            if (occ >= 85) barColor = 'bg-purple-600';
            else if (occ >= 70) barColor = 'bg-amber-500';

            return (
              <div key={item.room_type} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-slate-800 text-sm">{item.room_type} Category</span>
                  <span className="font-black text-slate-900">{occ}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${occ}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Occupied: <b className="text-slate-800">{item.occupied_rooms}</b> of {item.total_rooms}</span>
                  <span>Available: <b className="text-emerald-600">{item.available_rooms} left</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Occupancy Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Historical & Projected Occupancy Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Room Type</th>
                <th className="px-4 py-3">Total Rooms</th>
                <th className="px-4 py-3">Occupied</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {historyRecords.slice(0, 10).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3 font-semibold text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{row.room_type}</td>
                  <td className="px-4 py-3 text-slate-500">{row.total_rooms}</td>
                  <td className="px-4 py-3 text-slate-800 font-bold">{row.occupied_rooms}</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">{row.available_rooms}</td>
                  <td className="px-4 py-3">
                    <span className="font-extrabold text-slate-900">{row.occupancy_rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
