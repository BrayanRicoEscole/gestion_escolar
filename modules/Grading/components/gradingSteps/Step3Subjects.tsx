import React from 'react';
import { BookOpen, FlaskConical } from 'lucide-react';
import { SchoolYear, Lab } from '../../../../types';

export const Step3Subjects: React.FC<{ 
  year: SchoolYear, 
  setYear: any, 
  selectedIdx: number, 
  onSelectStation: (i: number) => void,
  onMove: (subIdx: number, from: number, to: number) => void
}> = ({ year, setYear, selectedIdx, onSelectStation, onMove }) => {
  const currentStation = year.stations[selectedIdx];
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right-4 duration-300">
      <div className="w-full md:w-1/4 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleccionar Estación</p>
        {year.stations.map((s, i) => (
          <button key={s.id} onClick={() => onSelectStation(i)} className={`w-full p-5 rounded-2xl text-left text-sm font-black transition-all ${selectedIdx === i ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="font-black text-slate-800 text-2xl">Catálogo de Asignaturas</h4>
            <p className="text-slate-400 text-sm font-bold">Configurando: {currentStation?.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentStation?.subjects.map((sub, idx) => (
            <div key={sub.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><BookOpen size={20} /></div>
                <input type="text" value={sub.name} onChange={(e) => {
                  const ns = [...year.stations]; ns[selectedIdx].subjects[idx].name = e.target.value;
                  setYear({...year, stations: ns});
                }} className="flex-1 bg-transparent border-none font-black text-slate-700 p-0 focus:ring-0 text-base" placeholder="Nombre..." />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <FlaskConical size={14} className="text-slate-400" />
                  <select value={sub.lab} onChange={(e) => {
                    const ns = [...year.stations]; ns[selectedIdx].subjects[idx].lab = e.target.value as Lab;
                    setYear({...year, stations: ns});
                  }} className="text-[10px] font-black text-black text-primary bg-primary/5 border-none rounded-lg px-2 py-1 focus:ring-0">
                    {Object.values(Lab).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mover a:</span>
                  <select value={selectedIdx} onChange={(e) => onMove(idx, selectedIdx, Number(e.target.value))} className="text-[10px] font-black text-slate-600 bg-slate-200/50 border-none rounded-lg px-2 py-1 focus:ring-0">
                    {year.stations.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};