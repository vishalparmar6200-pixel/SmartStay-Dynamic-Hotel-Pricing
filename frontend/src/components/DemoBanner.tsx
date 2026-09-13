import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ChevronRight, ChevronLeft, CheckCircle2, PlayCircle, Eye } from 'lucide-react';

interface DemoStep {
  step: number;
  title: string;
  description: string;
  path: string;
  role: 'ADMIN' | 'CUSTOMER';
  actionPrompt?: string;
}

const DEMO_STEPS: DemoStep[] = [
  { step: 1, title: 'Login as Hotel Admin', description: 'Access executive revenue management workspace with admin credentials.', path: '/admin', role: 'ADMIN' },
  { step: 2, title: 'Observe Current Occupancy (82%)', description: 'Notice current occupancy rate is healthy and approaching capacity.', path: '/admin/occupancy', role: 'ADMIN' },
  { step: 3, title: 'View Upcoming Festival (Diwali)', description: 'Inspect festival calendar impact (+25% surge).', path: '/admin/festivals', role: 'ADMIN' },
  { step: 4, title: 'Check Local Event (Conference)', description: 'Local conferences and exhibitions driving hotel demand (+15%).', path: '/admin/events', role: 'ADMIN' },
  { step: 5, title: 'Review Weather Conditions (Good)', description: 'Favorable travel weather contributing positively to demand.', path: '/admin/weather', role: 'ADMIN' },
  { step: 6, title: 'Open Demand Analytics (Score: 89)', description: 'Demand score calculated at 89/100 (Very High Demand).', path: '/admin/demand', role: 'ADMIN' },
  { step: 7, title: 'Open Pricing Recommendations', description: 'Engine recommends dynamic price ₹5,160 (Base ₹3,000 + adjustments).', path: '/admin/recommendations', role: 'ADMIN' },
  { step: 8, title: 'Inspect Audit Explanation', description: 'Review transparent natural language reason without AI black-box.', path: '/admin/recommendations', role: 'ADMIN' },
  { step: 9, title: 'Approve Recommendation', description: 'Click "Approve" to accept the suggested rate.', path: '/admin/recommendations', role: 'ADMIN' },
  { step: 10, title: 'Verify Room Price Updated', description: 'Room inventory current price is updated to the approved rate.', path: '/admin/rooms', role: 'ADMIN' },
  { step: 11, title: 'Switch to Customer Booking Portal', description: 'Customer sees live dynamic price with demand explanation.', path: '/customer/search', role: 'CUSTOMER' },
  { step: 12, title: 'Make a Simulated Booking', description: 'Book a room to test real-time closed feedback loop.', path: '/customer/search', role: 'CUSTOMER' },
  { step: 13, title: 'Verify Occupancy Change', description: 'Occupancy table immediately increases by sold room.', path: '/admin/occupancy', role: 'ADMIN' },
  { step: 14, title: 'Verify Price Recalculation', description: 'Pricing engine automatically recalculates for updated availability.', path: '/admin/recommendations', role: 'ADMIN' },
  { step: 15, title: 'Review Revenue Analytics (+14.35%)', description: 'Inspect ADR, RevPAR, and Fixed vs Dynamic revenue comparison uplift.', path: '/admin/revenue', role: 'ADMIN' },
];

export const DemoBanner: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const step = DEMO_STEPS[currentStepIdx];

  const goToStep = async (idx: number) => {
    if (idx < 0 || idx >= DEMO_STEPS.length) return;
    setCurrentStepIdx(idx);
    const target = DEMO_STEPS[idx];
    await switchRole(target.role);
    navigate(target.path);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl text-xs font-bold transition-all"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
        <span>Resume Internship Demo Guide (Step {step.step}/15)</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-6 py-2.5 shadow-md select-none sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Step counter & title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>INTERNSHIP DEMO GUIDE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-brand-300">Step {step.step} of 15:</span>
            <span className="font-semibold text-white">{step.title}</span>
          </div>
        </div>

        {/* Center: Description */}
        <div className="hidden lg:block text-slate-300 text-[11px] truncate max-w-md">
          {step.description}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToStep(currentStepIdx - 1)}
            disabled={currentStepIdx === 0}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => goToStep(currentStepIdx)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold transition shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>View Step {step.step}</span>
          </button>

          <button
            onClick={() => goToStep(currentStepIdx + 1)}
            disabled={currentStepIdx === DEMO_STEPS.length - 1}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white px-2 text-[11px] underline"
          >
            Minimize
          </button>
        </div>
      </div>
    </div>
  );
};
