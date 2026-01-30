import React, { useState } from 'react';
import { Target, PlusCircle, Trash2, Award } from 'lucide-react';
import { SchoolYear, Level, Skill } from '../../../../types';

export const Step8Skills: React.FC<{
  year: SchoolYear,
  setYear: any,
  stationIdx: number,
  subjectIdx: number,
  onSelectStation: (i: number) => void,
  onSelectSubject: (i: number) => void
}> = ({ year, setYear, stationIdx, subjectIdx, onSelectStation, onSelectSubject }) => {
  const currentStation = year.stations[stationIdx];
  const currentSubject = currentStation?.subjects[subjectIdx];
  const [selectedLevel, setSelectedLevel] = useState<Level>(Level.C);

  const addSkill = () => {
    if (!currentSubject) return;
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      level: selectedLevel,
      description: ''
    };
    const ns = [...year.stations];
    const sub = ns[stationIdx].subjects[subjectIdx];
    sub.skills = [...(sub.skills || []), newSkill];
    setYear({ ...year, stations: ns });
  };

  const removeSkill = (id: string) => {
    const ns = [...year.stations];
    const sub = ns[stationIdx].subjects[subjectIdx];
    sub.skills = (sub.skills || []).filter(s => s.id !== id);
    setYear({ ...year, stations: ns });
  };

  const updateSkill = (id: string, text: string) => {
    const ns = [...year.stations];
    const sub = ns[stationIdx].subjects[subjectIdx];
    const skill = sub.skills?.find(s => s.id === id);
    if (skill) skill.description = text;
    setYear({ ...year, stations: ns });
  };

  const levelSkills = currentSubject?.skills?.filter(s => s.level === selectedLevel) || [];

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right-4 duration-300">
      <div className="w-full md:w-1/4 space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración</p>
        <div className="space-y-2">
          <select value={stationIdx} onChange={(e) => onSelectStation(Number(e.target.value))} className="w-full p-4 rounded-2xl text-xs font-black border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
            {year.stations.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
          </select>
          <select value={subjectIdx} onChange={(e) => onSelectSubject(Number(e.target.value))} className="w-full p-4 rounded-2xl text-xs font-black border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
            {currentStation?.subjects.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
          </select>
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Nivel (Grado)</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(Level).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`p-4 rounded-2xl text-center text-sm font-black transition-all ${selectedLevel === lvl ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Habilidades por Grado</span>
            </div>
            <h4 className="font-black text-slate-800 text-3xl tracking-tight">Criterios de Desempeño</h4>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
              {currentSubject?.name} — Nivel {selectedLevel}
            </p>
          </div>
          <button 
            onClick={addSkill}
            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <PlusCircle size={22} /> Nueva Habilidad
          </button>
        </div>

        <div className="space-y-4">
          {levelSkills.map((skill, idx) => (
            <div key={skill.id} className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-black text-slate-400 border shrink-0 shadow-sm">{idx + 1}</div>
              <textarea
                value={skill.description}
                onChange={(e) => updateSkill(skill.id, e.target.value)}
                placeholder={`Escriba la habilidad para el nivel ${selectedLevel}...`}
                className="flex-1 bg-transparent border-none font-bold text-slate-700 p-0 text-sm focus:ring-0 resize-none min-h-[60px]"
              />
              <button 
                onClick={() => removeSkill(skill.id)}
                className="p-2 text-slate-300 hover:text-rose-500 transition-all self-start"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {levelSkills.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
              <Target size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black text-sm uppercase tracking-tight">Sin habilidades para el Nivel {selectedLevel}</p>
              <p className="text-slate-300 text-[10px] mt-1 uppercase font-bold tracking-widest">Define qué debe lograr el estudiante en este grado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};