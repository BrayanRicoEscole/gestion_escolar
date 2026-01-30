import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const WeightBadge: React.FC<{ total: number }> = ({ total }) => {
  const isCorrect = Math.abs(total - 100) < 0.1;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${
        isCorrect
          ? 'bg-green-50 text-green-600 border border-green-100'
          : 'bg-amber-50 text-amber-600 border border-amber-100'
      }`}
    >
      {isCorrect ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      Total: {total}% {isCorrect ? '(Correcto)' : '(Debe ser 100%)'}
    </div>
  );
};
