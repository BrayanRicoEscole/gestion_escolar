import React from 'react';
import { SchoolYear } from '../../../../types';

export const Step1Year: React.FC<{ year: SchoolYear, setYear: any }> = ({ year, setYear }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
      <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Nombre del Año Escolar</label>
      <input 
        type="text" 
        value={year.name}
        onChange={(e) => setYear({ ...year, name: e.target.value })}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all"
      />
    </div>
  </div>
);

