
import React, { useState, useMemo } from 'react';
import { Target, PlusCircle, Trash2, Award, ChevronRight, BookOpen } from 'lucide-react';
import { SchoolYear, Level, Skill } from '../../../../types';

const CATEGORIES = [
  { id: 'petine', name: 'Petiné', range: [Level.C], color: 'bg-rose-500' },
  { id: 'elementary', name: 'Elementary', range: [Level.D, Level.E, Level.F, Level.G], color: 'bg-amber-500' },
  { id: 'middle', name: 'Middle', range: [Level.H, Level.I, Level.J, Level.K], color: 'bg-blue-500' },
  { id: 'high', name: 'High', range: [Level.L, Level.M, Level.N], color: 'bg-slate-900' },
];

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
  
  const [activeCategoryId, setActiveCategoryId] = useState('petine');
  const [selectedLevel, setSelectedLevel] = useState<Level>(Level.C);

  const activeCategory = useMemo(() => 
    CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0]
  , [activeCategoryId]);

  const addSkill = () => {
    if (!currentSubject) return;
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      level: selectedLevel,
      description: ''
    };
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      sub.skills = [...(sub.skills || []), newSkill];
      return nextYear;
    });
  };

  const removeSkill = (id: string) => {
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      sub.skills = (sub.skills || []).filter(s => s.id !== id);
      return nextYear;
    });
  };

  const updateSkill = (id: string, text: string) => {
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      const skill = sub.skills?.find(s => s.id === id);
      if (skill) skill.description = text;
      return nextYear;
    });
  };

  const levelSkills = currentSubject?.skills?.filter(s => s.level === selectedLevel) || [];

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setActiveCategoryId(cat.id);
    setSelectedLevel(cat.range[0]);
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
      {/* Header con Selección de Estructura Principal */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1. Estación</label>
              <select value={stationIdx} onChange={(e) => onSelectStation(Number(e.target.value))} className="p-3 bg-slate-50 border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none min-w-[150px]">
                {year.stations.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
              </select>
           </div>
           <ChevronRight className="text-slate-200" />
           <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">2. Materia</label>
              <select value={subjectIdx} onChange={(e) => onSelectSubject(Number(e.target.value))} className="p-3 bg-slate-50 border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none min-w-[200px]">
                {currentStation?.subjects.map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
              </select>
           </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategoryId === cat.id 
                  ? `${cat.color} text-white shadow-lg scale-105` 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Selector de Letras dentro de la Categoría */}
        <div className="w-full md:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Niveles en {activeCategory.name}</p>
            <div className="grid grid-cols-2 gap-3">
              {activeCategory.range.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`p-5 rounded-2xl text-center text-xl font-black transition-all border-4 ${
                    selectedLevel === lvl 
                      ? 'bg-white border-primary text-primary shadow-xl scale-105' 
                      : 'bg-slate-50 text-slate-300 border-transparent hover:border-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl">
             <div className="flex items-center gap-2 mb-2 text-primary">
                <BookOpen size={16} />
                <span className="text-[10px] font-black uppercase">Tips</span>
             </div>
             <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
               Las habilidades definidas aquí se mostrarán automáticamente a los docentes que califiquen el nivel <strong>{selectedLevel}</strong> en <strong>{currentSubject?.name}</strong>.
             </p>
          </div>
        </div>

        {/* Panel de Edición de Habilidades */}
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editor de Habilidades</span>
              </div>
              <h4 className="font-black text-slate-800 text-3xl tracking-tight">Grado {selectedLevel}</h4>
              <div className="mt-1 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${activeCategory.color}`}></div>
                 <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                   Categoría: {activeCategory.name}
                 </span>
              </div>
            </div>
            <button 
              onClick={addSkill}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle size={22} /> Agregar Desempeño
            </button>
          </div>

          <div className="space-y-4">
            {levelSkills.map((skill, idx) => (
              <div key={skill.id} className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all group animate-in slide-in-from-top-2">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sm font-black text-slate-400 border shrink-0 shadow-sm group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>
                <textarea
                  value={skill.description}
                  onChange={(e) => updateSkill(skill.id, e.target.value)}
                  placeholder={`Defina el criterio de desempeño para el estudiante de nivel ${selectedLevel}...`}
                  className="flex-1 bg-transparent border-none font-bold text-slate-700 p-0 text-sm focus:ring-0 resize-none min-h-[80px]"
                />
                <button 
                  onClick={() => removeSkill(skill.id)}
                  className="p-3 text-slate-300 hover:text-rose-500 transition-all self-start bg-white rounded-xl shadow-sm border border-slate-50 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {levelSkills.length === 0 && (
              <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                <Target size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-sm uppercase tracking-tight">Sin habilidades definidas</p>
                <p className="text-slate-300 text-[10px] mt-1 uppercase font-bold tracking-widest">Comience agregando el primer criterio de evaluación</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
