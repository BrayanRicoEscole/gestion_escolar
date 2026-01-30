import React from 'react';
import { SchoolYear } from '../../../../types';
import { WeightBadge } from './WeightBadge';

export const Step2Stations: React.FC<{ year: SchoolYear, setYear: any, total: number }> = ({ year, setYear, total }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-black text-slate-800">Estaciones del Año</h3>
      <WeightBadge total={total} />
    </div>
    <div className="grid gap-4">
      {year.stations.map((s, idx) => (
        <div key={s.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end group">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Identificador</label>
            <input 
              type="text" 
              value={s.name}
              onChange={(e) => {
                const ns = [...year.stations]; ns[idx].name = e.target.value;
                setYear({ ...year, stations: ns });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Ponderación (%)</label>
            <input 
              type="number" 
              value={s.weight}
              onChange={(e) => {
                const ns = [...year.stations]; ns[idx].weight = Number(e.target.value);
                setYear({ ...year, stations: ns });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Cronograma Académico</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={s.startDate} onChange={(e) => {
                const ns = [...year.stations]; ns[idx].startDate = e.target.value;
                setYear({ ...year, stations: ns });
              }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-black" />
              <input type="date" value={s.endDate} onChange={(e) => {
                const ns = [...year.stations]; ns[idx].endDate = e.target.value;
                setYear({ ...year, stations: ns });
              }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-black" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);