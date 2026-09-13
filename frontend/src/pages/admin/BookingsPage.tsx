import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingsApi.getAll({
        status: statusFilter === 'All' ? undefined : statusFilter
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleCancel = async () => {
    if (!cancelModalBooking) return;
    try {
      await bookingsApi.cancel(cancelModalBooking.id);
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = bookings.filter((b) =>
    (b.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.room_number || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bookings & Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reservations driving occupancy calculations and dynamic pricing triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search guest or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Booking ID</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Check-In</th>
                <th className="px-4 py-3">Check-Out</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Paid Dynamic Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400 italic">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-500">#{b.id}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">{b.customer_name || 'Valued Guest'}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800">Room {b.room_number}</span>
                      <span className="text-[10px] text-slate-400 block">{b.room_type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{b.check_in}</td>
                    <td className="px-4 py-3.5 text-slate-600">{b.check_out}</td>
                    <td className="px-4 py-3.5 text-slate-500">{b.number_of_guests}</td>
                    <td className="px-4 py-3.5 font-extrabold text-emerald-600 text-sm">
                      ₹{b.price_paid.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cancel Reservation #{cancelModalBooking.id}?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Canceling will immediately restore Room {cancelModalBooking.room_number} to available inventory, recalculate hotel occupancy, and trigger automatic dynamic repricing.
            </p>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
