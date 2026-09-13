import React, { useState, useEffect } from 'react';
import { CalendarRange, Plus, MapPin, Users, Trash2, Calendar } from 'lucide-react';
import { eventsApi } from '../../services/api';
import { FestivalEvent } from '../../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [eventType, setEventType] = useState<string>('Conference');
  const [importance, setImportance] = useState<string>('High');
  const [impact, setImpact] = useState<number>(20);
  const [desc, setDesc] = useState<string>('');

  const fetchEvents = async () => {
    try {
      const res = await eventsApi.getAll();
      // Filter out Festivals/Holidays to show local conferences, sports, concerts, etc.
      const localEvents = res.data.filter((e) => !['Festival', 'Holiday'].includes(e.event_type));
      setEvents(localEvents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.create({
        name,
        date,
        location: 'Jaipur',
        event_type: eventType,
        importance,
        demand_impact: impact,
        description: desc
      });
      setShowModal(false);
      setName('');
      setDate('');
      await fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await eventsApi.delete(id);
      await fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Local Events & Conferences</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conferences, IPL matches, concerts, and wedding seasons driving transient hotel demand.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Local Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarRange className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                +{ev.demand_impact}% Surge
              </span>
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ev.event_type}</div>
              <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{ev.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{ev.date}</span>
                <span>&bull;</span>
                <span className="font-bold text-slate-700">{ev.importance} Scale</span>
              </div>
            </div>

            {ev.description && (
              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                {ev.description}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3" /> {ev.location}
              </span>
              <button
                onClick={() => handleDelete(ev.id)}
                className="text-rose-500 hover:text-rose-700 p-1"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add Local Event / Conference</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. International Medical Summit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Match">Cricket Match / Sports</option>
                    <option value="Concert">Concert / Musical</option>
                    <option value="Exhibition">Exhibition / Expo</option>
                    <option value="Wedding">Wedding Season</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Importance</label>
                  <select
                    value={importance}
                    onChange={(e) => {
                      setImportance(e.target.value);
                      if (e.target.value === 'Very High') setImpact(30);
                      else if (e.target.value === 'High') setImpact(20);
                      else if (e.target.value === 'Medium') setImpact(10);
                      else setImpact(5);
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="Low">Low (+5%)</option>
                    <option value="Medium">Medium (+10%)</option>
                    <option value="High">High (+20%)</option>
                    <option value="Very High">Very High (+30%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Surge Impact (+%)</label>
                  <input
                    type="number"
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Expected Crowd</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Estimated 10,000+ delegates traveling to Jaipur."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
