import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomsApi, bookingsApi } from '../../services/api';
import { Room } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Calendar, Users, BedDouble, CheckCircle2, ArrowRight } from 'lucide-react';

export const BookingCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roomId = Number(searchParams.get('roomId'));
  const checkIn = searchParams.get('checkIn') || new Date().toISOString().split('T')[0];
  const checkOut = searchParams.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const guests = Number(searchParams.get('guests')) || 2;

  const [room, setRoom] = useState<Room | null>(null);
  const [guestName, setGuestName] = useState<string>(user?.name || 'Ananya Verma');
  const [guestEmail, setGuestEmail] = useState<string>(user?.email || 'customer@smartstay.com');
  const [guestPhone, setGuestPhone] = useState<string>('+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState<string>('High floor, heritage garden view preferred');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      roomsApi.getById(roomId).then((res) => setRoom(res.data)).catch(console.error);
    }
  }, [roomId]);

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = room ? room.current_price * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await bookingsApi.create({
        hotel_id: room.hotel_id,
        room_id: room.id,
        customer_id: user?.id,
        customer_name: guestName,
        customer_email: guestEmail,
        check_in: checkIn,
        check_out: checkOut,
        number_of_guests: guests
      });

      // Navigate to confirmation page
      navigate(`/customer/confirmation/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Booking failed. Please select another room or date.");
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading reservation details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Simulated Guest Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Instant booking confirmation. No real payment required. Submitting directly updates occupancy and triggers dynamic repricing.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-4 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Guest Details Form */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Primary Guest Information
          </h3>

          <form onSubmit={handleSubmit} id="bookingForm" className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free cancellation up to 24 hours prior to check-in. Zero cancellation penalties.</span>
            </div>
          </form>
        </div>

        {/* Invoice / Reservation Summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-base font-black text-slate-900">{room.room_type} Room</span>
                <span className="text-xs text-slate-400 block mt-0.5">Assigned Room #{room.room_number}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-200">
                Heritage
              </span>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <b className="text-slate-900">{checkIn} (From 2:00 PM)</b>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <b className="text-slate-900">{checkOut} (Until 11:00 AM)</b>
              </div>
              <div className="flex justify-between">
                <span>Total Duration:</span>
                <b className="text-slate-900">{nights} {nights === 1 ? 'Night' : 'Nights'}</b>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <b className="text-slate-900">{guests} Adults</b>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Dynamic Rate:</span>
                <span>₹{room.current_price.toLocaleString('en-IN')} &times; {nights} nights</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes & Luxury Cess:</span>
                <span className="text-emerald-600 font-bold">Included</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due:</span>
                <span className="text-brand-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              form="bookingForm"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Reservation...' : 'Complete Simulated Booking'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
