
import React from 'react';
import { SchoolYear } from '../../../../types';
import { WeightBadge } from './WeightBadge';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Props {
  year: SchoolYear;
  setYear: any;
  total: number;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export const Step2Stations: React.FC<Props> = ({ year, setYear, total, onAdd, onRemove }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-black text-slate-800">Estaciones del Año</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Defina los periodos académicos principales</p>
      </div>
      <div className="flex items-center gap-4">
        <WeightBadge total={total} />
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          <PlusCircle size={18} />
          Nueva Estación
        </button>
      </div>
    </div>
    <div className="grid gap-4">
      {year.stations.map((s, idx) => (
        <div key={s.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-end group relative hover:border-primary/20 transition-all">
          <div className="md:col-span-3">
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
          <div className="md:col-span-2">
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
          <div className="md:col-span-6">
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
          <div className="md:col-span-1 flex justify-end">
            <button 
              onClick={() => onRemove(idx)}
              className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
              title="Eliminar Estación"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
      {year.stations.length === 0 && (
        <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
          <PlusCircle size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase text-sm">No hay estaciones configuradas</p>
        </div>
      )}
    </div>
  </div>
);
