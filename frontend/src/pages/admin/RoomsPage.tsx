import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Edit2, Trash2, ArrowUpRight, DollarSign, Check, X } from 'lucide-react';
import { roomsApi } from '../../services/api';
import { Room } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [overrideRoom, setOverrideRoom] = useState<Room | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>('Manual admin override');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRoomNumber, setNewRoomNumber] = useState<string>('');
  const [newRoomType, setNewRoomType] = useState<string>('Deluxe');
  const [newBasePrice, setNewBasePrice] = useState<number>(3500);

  const fetchRooms = async () => {
    try {
      const res = await roomsApi.getAll({
        room_type: selectedType === 'All' ? undefined : selectedType
      });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedType]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideRoom) return;
    try {
      await roomsApi.overridePrice(overrideRoom.id, {
        new_price: newPrice,
        reason: overrideReason
      });
      setOverrideRoom(null);
      await fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsApi.create({
        hotel_id: 1,
        room_number: newRoomNumber,
        room_type: newRoomType,
        capacity: 2,
        base_price: newBasePrice,
        current_price: newBasePrice,
        status: 'Available'
      });
      setShowAddModal(false);
      setNewRoomNumber('');
      await fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Inventory & Dynamic Rates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage hotel rooms, compare base vs dynamic selling prices, or manually override rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Standard', 'Deluxe', 'Premium', 'Suite'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedType === t ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Room No.</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Base Rate</th>
                <th className="px-4 py-3">Current Dynamic Rate</th>
                <th className="px-4 py-3">Price Variance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rooms.map((room) => {
                const variance = ((room.current_price - room.base_price) / room.base_price) * 100;
                return (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                      Room {room.room_number}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{room.room_type}</td>
                    <td className="px-4 py-3.5 text-slate-500">{room.capacity} Guests</td>
                    <td className="px-4 py-3.5 text-slate-500">₹{room.base_price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 font-extrabold text-brand-600 text-sm">
                      ₹{room.current_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          variance > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : variance < 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {variance > 0 ? `+${variance.toFixed(0)}%` : `${variance.toFixed(0)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={room.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setOverrideRoom(room);
                          setNewPrice(room.current_price);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        Override Rate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Price Override Modal */}
      {overrideRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Manual Price Override – Room {overrideRoom.room_number}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current: ₹{overrideRoom.current_price.toLocaleString('en-IN')} (Base: ₹{overrideRoom.base_price.toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleOverrideSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Room Price (₹)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Override (Audit Log)</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOverrideRoom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  Apply & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add New Hotel Room</h3>
            <form onSubmit={handleAddRoom} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. 305"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Category</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Premium">Premium</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
