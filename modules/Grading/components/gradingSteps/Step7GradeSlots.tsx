
import React from 'react';
import { PlusCircle, Trash2, BookOpen, Layers } from 'lucide-react'
import { SchoolYear } from '../../../../types';
import { WeightBadge } from './WeightBadge';

export const Step7GradeSlots: React.FC<{
  year: SchoolYear,
  setYear: any,
  stationIdx: number,
  momentIdx: number,
  sectionIdx: number,
  subjectIdx: number,
  onSelectStation: (i: number) => void,
  onSelectMoment: (i: number) => void,
  onSelectSection: (i: number) => void,
  onSelectSubject: (i: number) => void,
  onAdd: () => void,
  onMove: (slotIdx: number, fromSec: number, toSec: number) => void,
  total: number
}> = ({ year, setYear, stationIdx, momentIdx, sectionIdx, subjectIdx, onSelectStation, onSelectMoment, onSelectSection, onSelectSubject, onAdd, onMove, total }) => {
  const currentStation = year.stations[stationIdx];
  const currentMoment = currentStation?.moments[momentIdx];
  const currentSection = currentMoment?.sections[sectionIdx];
  
  // Ahora mostramos todos los slots de la sección sin filtrar por subjectId
  const allSlots = currentSection?.gradeSlots || [];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">1. Estación / Momento</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select value={stationIdx} onChange={(e) => onSelectStation(Number(e.target.value))} className="w-full p-3 rounded-xl text-[10px] text-black font-black border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20">
                {year.stations.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
              </select>
              <select value={momentIdx} onChange={(e) => onSelectMoment(Number(e.target.value))} className="w-full p-3 rounded-xl text-[10px] font-black border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20">
                {currentStation?.moments.map((m, i) => <option key={m.id} value={i}>{m.name.split('/')[0]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">2. Sección de Evaluación</p>
            <div className="space-y-2">
              {currentMoment?.sections.map((se, i) => (
                <button 
                  key={se.id} 
                  onClick={() => onSelectSection(i)} 
                  className={`w-full text-left px-6 py-5 rounded-[2rem] text-sm font-black flex items-center justify-between transition-all ${sectionIdx === i ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Layers size={14} className={sectionIdx === i ? 'text-primary' : 'text-slate-300'} />
                    <span className="truncate">{se.name}</span>
                  </div>
                  <span className="font-black opacity-60 bg-white/10 px-3 py-1 rounded-full text-[10px]">{se.weight}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Configuración Global de Notas</span>
              </div>
              <h4 className="font-black text-slate-800 text-3xl tracking-tight">Criterios de Evaluación</h4>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">Sección: {currentSection?.name}</p>
              <div className="mt-4">
                <WeightBadge total={total} />
              </div>
            </div>
            <button 
              disabled={!currentSection}
              onClick={onAdd} 
              className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
            >
              <PlusCircle size={22} className="inline mr-2" /> Nueva Nota
            </button>
          </div>
          
          <div className="space-y-4">
            {allSlots.map((slot, idx) => {
              return (
                <div key={slot.id} className="flex flex-col gap-4 p-6 bg-white border-2 border-slate-100 rounded-3xl group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border">{idx + 1}</div>
                    <input 
                      type="text" 
                      value={slot.name} 
                      onChange={(e) => {
                        const ns = [...year.stations];
                        const sIdx = ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots.findIndex(s => s.id === slot.id);
                        if (sIdx !== -1) {
                          ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots[sIdx].name = e.target.value;
                          setYear({...year, stations: ns});
                        }
                      }} 
                      className="flex-1 bg-transparent border-none font-black text-slate-800 p-0 focus:ring-0 text-lg"
                      placeholder="Nombre de la evaluación..."
                    />
                    <div className="flex flex-col items-end">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">Peso (%)</label>
                      <input 
                        type="number" 
                        value={slot.weight} 
                        onChange={(e) => {
                          const ns = [...year.stations]; 
                          const sIdx = ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots.findIndex(s => s.id === slot.id);
                          if (sIdx !== -1) {
                            ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots[sIdx].weight = Number(e.target.value);
                            setYear({...year, stations: ns});
                          }
                        }} 
                        className="w-16 bg-slate-50 border border-slate-100 rounded-xl py-2 px-2 text-center font-black text-slate-800 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const ns = [...year.stations];
                        ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots = 
                          ns[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots.filter(s => s.id !== slot.id);
                        setYear({...year, stations: ns});
                      }}
                      className="text-slate-300 hover:text-red-500 transition-all p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">Escala: 1.0 - 5.0</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mover a:</span>
                      <select 
                        value={sectionIdx} 
                        onChange={(e) => {
                          const sIdx = year.stations[stationIdx].moments[momentIdx].sections[sectionIdx].gradeSlots.findIndex(s => s.id === slot.id);
                          onMove(sIdx, sectionIdx, Number(e.target.value));
                        }} 
                        className="text-[10px] font-black text-slate-600 bg-slate-100 border-none rounded-lg px-3 py-1.5 focus:ring-0"
                      >
                        {currentMoment?.sections.map((sec, i) => (
                          <option key={sec.id} value={i}>{sec.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
            {allSlots.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <PlusCircle size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-sm uppercase">No hay notas configuradas en esta sección</p>
                <p className="text-slate-300 text-[10px] mt-1 uppercase font-bold tracking-widest">Estas notas se aplicarán a todas las materias</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
