import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Calendar, BedDouble, AlertCircle, XCircle } from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // In customer view, show all confirmed/active bookings or current user's
      const res = await bookingsApi.getAll();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Guest Reservations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your booked stays. Canceling frees up room availability and triggers dynamic pricing recalculations.
        </p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm text-xs text-slate-400 italic">
            No bookings found. Try booking a room from the search page!
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">Room {b.room_number}</span>
                    <span className="text-xs font-bold text-slate-500">({b.room_type})</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.check_in} &rarr; {b.check_out}
                    </span>
                    <span>&bull;</span>
                    <span>{b.number_of_guests} Guests</span>
                    <span>&bull;</span>
                    <span>Ref: #{b.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Price Paid</span>
                  <span className="text-base font-black text-slate-900">₹{b.price_paid.toLocaleString('en-IN')}</span>
                </div>

                {b.status === 'Confirmed' && (
                  <button
                    onClick={() => setCancelModalBooking(b)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    Cancel Stay
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Cancel Booking #{cancelModalBooking.id}?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Canceling will immediately restore Room {cancelModalBooking.room_number} to inventory and update occupancy.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Stay
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
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
