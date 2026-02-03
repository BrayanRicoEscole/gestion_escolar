import React, { memo } from 'react';
import { Lock, Users } from 'lucide-react';

interface ConvivenciaBlockProps {
  value: number | null;
  isEditable: boolean;
  onChange: (value: string) => void;
}

export const ConvivenciaBlock: React.FC<ConvivenciaBlockProps> = memo(
  ({ value, isEditable, onChange }) => {
    return (
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl shadow-sm">
            <Users size={32} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-2xl tracking-tight">
              Nota de Convivencia
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Única nota numérica: 1 o 5 solamente
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {!isEditable && <Lock className="text-rose-400" size={20} />}

          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="-"
            disabled={!isEditable}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            className={`w-24 p-5 text-center text-3xl font-black rounded-2xl border-4 transition-all outline-none ${
              !isEditable
                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border-amber-100 focus:border-amber-400 text-amber-600 shadow-sm'
            }`}
          />
        </div>
      </section>
    );
  }
);

ConvivenciaBlock.displayName = 'ConvivenciaBlock';
