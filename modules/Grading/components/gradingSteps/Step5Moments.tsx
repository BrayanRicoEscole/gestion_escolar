
import React from 'react';
import {ChevronRight, GripVertical, PlusCircle, Trash2} from 'lucide-react'
import { SchoolYear } from '../../../../types';
import { WeightBadge } from './WeightBadge';

interface Props {
  year: SchoolYear;
  setYear: any;
  stationIdx: number;
  onSelectStation: (i: number) => void;
  total: number;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export const Step5Moments: React.FC<Props> = ({ year, setYear, stationIdx, onSelectStation, total, onAdd, onRemove }) => {
  const currentStation = year.stations[stationIdx];
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right-4 duration-300">
      <div className="w-full md:w-1/3 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Estación</p>
        <div className="space-y-2">
          {year.stations.map((s, i) => (
            <button key={s.id} onClick={() => onSelectStation(i)} className={`w-full p-5 rounded-2xl text-left flex items-center justify-between transition-all ${stationIdx === i ? 'bg-primary text-white shadow-2xl scale-105' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
              <span className="font-black text-sm">{s.name}</span>
              <ChevronRight size={16} className={stationIdx === i ? 'text-white/60' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h4 className="font-black text-slate-800 text-2xl">Momentos de Aprendizaje</h4>
            <div className="mt-2">
              <WeightBadge total={total} />
            </div>
          </div>
          <button 
            onClick={onAdd}
            disabled={!currentStation}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-30"
          >
            <PlusCircle size={18} />
            Nuevo Momento
          </button>
        </div>
        <div className="space-y-4">
          {currentStation?.moments.map((m, mi) => (
            <div key={m.id} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group transition-all hover:border-primary/20">
              <GripVertical className="text-slate-300 shrink-0" size={20} />
              <input type="text" value={m.name} onChange={(e) => {
                const ns = [...year.stations]; ns[stationIdx].moments[mi].name = e.target.value;
                setYear({...year, stations: ns});
              }} className="flex-1 bg-transparent border-none font-black text-slate-700 p-0 text-lg focus:ring-0" />
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Peso:</span>
                <input type="number" value={m.weight} onChange={(e) => {
                  const ns = [...year.stations]; ns[stationIdx].moments[mi].weight = Number(e.target.value);
                  setYear({...year, stations: ns});
                }} className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-center font-black text-primary focus:ring-2 focus:ring-primary/20" />
                <span className="text-sm font-black text-slate-500">%</span>
                <button 
                  onClick={() => onRemove(mi)}
                  className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar Momento"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {(!currentStation || currentStation.moments.length === 0) && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
               <PlusCircle size={32} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black text-sm uppercase">Sin momentos configurados en esta estación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
