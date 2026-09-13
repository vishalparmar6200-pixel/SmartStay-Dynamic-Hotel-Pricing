import React, { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Clock, Search, ArrowRight } from 'lucide-react';
import { pricingApi } from '../../services/api';
import { PriceHistory } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PriceHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [filterRoom, setFilterRoom] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await pricingApi.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const chartData = [...history]
    .reverse()
    .slice(0, 15)
    .map((h) => ({
      date: new Date(h.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: h.new_price,
      old: h.old_price,
      reason: h.reason,
      room: h.room_number,
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Price Change Audit & History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete transparent log of all algorithmic and manual room price transitions with justification reasons.
        </p>
      </div>

      {/* Price Evolution Line Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Room Price Dynamics (Timeline)</h3>
        <p className="text-xs text-slate-500 mb-4">Historical rate movements captured across pricing iterations</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Room Rate']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="price" stroke="#0c8de7" strokeWidth={3} dot={{ r: 4, fill: '#0c8de7' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Price Adjustment Audit Log</h3>
          <span className="text-xs font-semibold text-slate-500">{history.length} Total Price Revisions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Room</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Old Price</th>
                <th className="px-4 py-3">New Price</th>
                <th className="px-4 py-3">Difference</th>
                <th className="px-5 py-3">Audit Reason</th>
                <th className="px-4 py-3">Changed By</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.map((item) => {
                const diff = item.new_price - item.old_price;
                const pct = item.old_price > 0 ? ((diff / item.old_price) * 100).toFixed(1) : '0';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">Room {item.room_number}</td>
                    <td className="px-4 py-3.5 text-slate-600">{item.room_type}</td>
                    <td className="px-4 py-3.5 text-slate-500">₹{item.old_price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      ₹{item.new_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          diff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {diff >= 0 ? `+₹${diff.toLocaleString('en-IN')} (+${pct}%)` : `-₹${Math.abs(diff).toLocaleString('en-IN')} (${pct}%)`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm truncate text-slate-700 font-medium">
                      {item.reason}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {item.changed_by}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(item.changed_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
