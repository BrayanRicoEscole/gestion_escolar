
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ValidationBadgeProps {
  isValid: boolean;
  label?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({ isValid, label }) => (
  <div className="flex justify-center">
    <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-tight ${
      isValid ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
    }`}>
      {isValid ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      {label || (isValid ? 'Completo' : 'Incompleto')}
    </div>
  </div>
);
