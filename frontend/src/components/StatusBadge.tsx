import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  if (norm === 'approved' || norm === 'confirmed' || norm === 'available') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm === 'applied') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (norm === 'pending') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (norm === 'rejected' || norm === 'cancelled' || norm === 'occupied') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm === 'maintenance') {
    styles = 'bg-slate-100 text-slate-600 border-slate-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${styles}`}>
      {status}
    </span>
  );
};
