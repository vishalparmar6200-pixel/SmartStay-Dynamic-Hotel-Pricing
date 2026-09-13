import React from 'react';

interface DemandBadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const DemandBadge: React.FC<DemandBadgeProps> = ({ level, score, size = 'md' }) => {
  const norm = (level || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  if (norm.includes('low')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm.includes('mod')) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (norm.includes('very high')) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (norm.includes('high')) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${styles} ${sizeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{level}</span>
      {score !== undefined && <span className="opacity-75">({score.toFixed(0)})</span>}
    </span>
  );
};
