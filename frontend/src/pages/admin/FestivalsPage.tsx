import React, { useState, useEffect } from 'react';
import { PartyPopper, Plus, Calendar, Sparkles, Trash2, MapPin } from 'lucide-react';
import { eventsApi } from '../../services/api';
import { FestivalEvent } from '../../types';

export const FestivalsPage: React.FC = () => {
  const [festivals, setFestivals] = useState<FestivalEvent[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [importance, setImportance] = useState<string>('Major');
  const [impact, setImpact] = useState<number>(25);
  const [desc, setDesc] = useState<string>('');

  const fetchFestivals = async () => {
    try {
      const res = await eventsApi.getAll({ event_type: 'Festival' });
      setFestivals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.create({
        name,
        date,
        location: 'Jaipur',
        event_type: 'Festival',
        importance,
        demand_impact: impact,
        description: desc
      });
      setShowModal(false);
      setName('');
      setDate('');
      await fetchFestivals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await eventsApi.delete(id);
      await fetchFestivals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Festivals & Holidays Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Major Indian festive seasons driving high room demand and multiplier surges (+10% to +35%).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Festival</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {festivals.map((fest) => (
          <div key={fest.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <PartyPopper className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{fest.demand_impact}% Surge
              </span>
            </div>

            <div className="mt-4">
              <h3 className="font-extrabold text-slate-900 text-base">{fest.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{fest.date}</span>
                <span>&bull;</span>
                <span className="font-bold text-slate-700">{fest.importance} Scale</span>
              </div>
            </div>

            {fest.description && (
              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                {fest.description}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3" /> {fest.location}
              </span>
              <button
                onClick={() => handleDelete(fest.id)}
                className="text-rose-500 hover:text-rose-700 p-1"
                title="Delete festival"
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
            <h3 className="text-base font-bold text-slate-900">Add Indian Festival / Holiday</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Festival Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali - Festival of Lights"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Importance</label>
                  <select
                    value={importance}
                    onChange={(e) => {
                      setImportance(e.target.value);
                      if (e.target.value === 'Peak') setImpact(35);
                      else if (e.target.value === 'Major') setImpact(25);
                      else if (e.target.value === 'Medium') setImpact(15);
                      else setImpact(10);
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="Normal">Normal Holiday</option>
                    <option value="Medium">Medium Festival</option>
                    <option value="Major">Major Festival</option>
                    <option value="Peak">Peak Festival</option>
                  </select>
                </div>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Market Notes</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
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
                  Save Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
