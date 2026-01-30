import React from 'react';
import {PlusCircle, Layers, Trash2 } from 'lucide-react'
import { SchoolYear } from '../../../../types';
import { WeightBadge } from './WeightBadge';


export const Step6Sections: React.FC<{
  year: SchoolYear,
  setYear: any,
  stationIdx: number,
  momentIdx: number,
  onSelectStation: (i: number) => void,
  onSelectMoment: (i: number) => void,
  onAdd: () => void,
  total: number
}> = ({ year, setYear, stationIdx, momentIdx, onSelectStation, onSelectMoment, onAdd, total }) => {
  const currentStation = year.stations[stationIdx];
  const currentMoment = currentStation?.moments[momentIdx];
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right-4 duration-300">
      <div className="w-full md:w-1/4 space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navegación</p>
        <div className="space-y-3">
          <select value={stationIdx} onChange={(e) => onSelectStation(Number(e.target.value))} className="w-full p-4 rounded-2xl text-sm text-black font-black border border-slate-200 bg-white shadow-sm">
            {year.stations.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
          </select>
          <div className="space-y-2">
            {currentStation?.moments.map((m, i) => (
              <button key={m.id} onClick={() => onSelectMoment(i)} className={`w-full p-4 rounded-2xl text-left text-xs font-black transition-all ${momentIdx === i ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="font-black text-slate-800 text-2xl">Rúbricas / Secciones</h4>
            <WeightBadge total={total} />
          </div>
          <button disabled={!currentMoment} onClick={onAdd} className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-bold hover:bg-primary/90 shadow-xl">
            <PlusCircle size={20} /> Nueva Sección
          </button>
        </div>
        <div className="space-y-4">
          {currentMoment?.sections.map((sec, si) => (
            <div key={sec.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                <Layers size={24} />
              </div>
              <input type="text" value={sec.name} onChange={(e) => {
                const ns = [...year.stations]; ns[stationIdx].moments[momentIdx].sections[si].name = e.target.value;
                setYear({...year, stations: ns});
              }} className="flex-1 bg-transparent border-none font-black text-slate-700 p-0 text-xl focus:ring-0" />
              <div className="flex items-center gap-4">
                <input type="number" value={sec.weight} onChange={(e) => {
                  const ns = [...year.stations]; ns[stationIdx].moments[momentIdx].sections[si].weight = Number(e.target.value);
                  setYear({...year, stations: ns});
                }} className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-center font-black text-primary focus:ring-2 focus:ring-primary/20" />
                <span className="text-sm font-black text-slate-400">%</span>
                <button className="p-3 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};