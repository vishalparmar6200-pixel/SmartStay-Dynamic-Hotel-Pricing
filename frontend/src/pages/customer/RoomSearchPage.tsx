import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BedDouble, Users, Sparkles, Check, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { roomsApi, demandApi } from '../../services/api';
import { Room } from '../../types';

export const RoomSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const checkIn = searchParams.get('checkIn') || today;
  const checkOut = searchParams.get('checkOut') || tomorrow;
  const guests = Number(searchParams.get('guests')) || 2;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const res = await roomsApi.getAll({ status: 'Available' });
        // Deduplicate one representative room per type for booking view
        const uniqueByType: { [key: string]: Room } = {};
        res.data.forEach((r) => {
          if (!uniqueByType[r.room_type]) {
            uniqueByType[r.room_type] = r;
          }
        });
        setRooms(Object.values(uniqueByType));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const calculateNights = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  const getReasonTag = (room: Room) => {
    const diff = room.current_price - room.base_price;
    if (diff > 500) {
      return "High demand for the selected date & upcoming festival surge";
    } else if (diff > 0) {
      return "Strong weekend & seasonal demand adjustment";
    }
    return "Standard value rate guaranteed";
  };

  const handleBookNow = (room: Room) => {
    navigate(`/customer/checkout?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="space-y-8">
      {/* Search context bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Selected Itinerary</span>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">
            {checkIn} &rarr; {checkOut} ({nights} {nights === 1 ? 'Night' : 'Nights'}) &bull; {guests} {guests === 1 ? 'Guest' : 'Guests'}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time Dynamic Best Price Guarantee</span>
        </div>
      </div>

      {/* Available Room Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const isSurge = room.current_price > room.base_price;
          const totalPrice = room.current_price * nights;

          return (
            <div
              key={room.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      Heritage Collection
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">{room.room_type} Room</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Assigned Room #{room.room_number} &bull; Up to {room.capacity} Guests</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100">
                    <BedDouble className="w-6 h-6" />
                  </div>
                </div>

                {/* Dynamic Price Display */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Rate per night</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-slate-900">
                          ₹{room.current_price.toLocaleString('en-IN')}
                        </span>
                        {isSurge && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{room.base_price.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">/ night</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total ({nights} Nights)</span>
                      <span className="text-lg font-black text-brand-600">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Explainability Tag (Section 23) */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-amber-900 font-semibold italic">
                      "{getReasonTag(room)}"
                    </span>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-5">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free High-Speed WiFi</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> King Size Heritage Bed</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Courtyard Garden View</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Complimentary Breakfast</div>
                </div>
              </div>

              {/* Book Action */}
              <button
                onClick={() => handleBookNow(room)}
                className="mt-6 w-full py-3 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Reserve Room (Instant Simulation)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
