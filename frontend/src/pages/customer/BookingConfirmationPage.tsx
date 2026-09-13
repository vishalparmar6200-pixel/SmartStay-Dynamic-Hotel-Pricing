import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Hotel, Calendar, BedDouble, ArrowRight, ArrowRightLeft, Sparkles, Download } from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (id) {
      bookingsApi.getById(Number(id)).then((res) => setBooking(res.data)).catch(console.error);
    }
  }, [id]);

  if (!booking) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading reservation confirmation...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Confirmation Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Reservation Confirmed
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
            Thank You! Your Stay is Booked.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Booking Confirmation Reference: <b className="text-slate-800">#SMART-{booking.id}</b>
          </p>
        </div>

        {/* Details Grid */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4 text-xs">
          <div className="flex justify-between border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Property</span>
              <span className="font-extrabold text-slate-900 text-sm">The Grand Palace Heritage Resort & Spa</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Room Number</span>
              <span className="font-extrabold text-slate-900 text-sm">Room {booking.room_number}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Check-in</span>
              <span className="font-bold text-slate-800">{booking.check_in} (From 2:00 PM)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Check-out</span>
              <span className="font-bold text-slate-800">{booking.check_out} (By 11:00 AM)</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <div>
              <span className="text-slate-400 block text-[11px]">Total Paid (Dynamic Rate)</span>
              <span className="text-xl font-black text-emerald-600">
                ₹{booking.price_paid.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold">
              SIMULATED CONFIRMATION
            </span>
          </div>
        </div>

        {/* Internship Demonstration Callout (Section 45 Steps 13-14) */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Internship Demonstration Verification</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            Because this reservation was confirmed, the system immediately:
            <br />
            1. <b>Updated Room {booking.room_number}</b> status to Occupied.
            <br />
            2. <b>Recalculated Occupancy</b> on the hotel occupancy table for {booking.check_in}.
            <br />
            3. <b>Triggered Dynamic Pricing Engine</b> to recalculate rates reacting to decreased remaining inventory!
          </p>

          <button
            onClick={async () => {
              await switchRole('ADMIN');
              navigate('/admin/occupancy');
            }}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Switch to Admin & Inspect Updated Occupancy (Step 13)</span>
          </button>
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-between text-xs pt-2">
          <Link to="/customer/my-bookings" className="font-bold text-slate-600 hover:text-slate-900">
            &larr; View My Bookings
          </Link>
          <Link to="/customer/search" className="font-bold text-brand-600 hover:text-brand-700">
            Book Another Room &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
