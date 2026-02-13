
import React, { useState, useMemo } from 'react';
import { Modality, Level } from '../../../../types';
import { Globe, CheckCircle2, LayoutGrid, Home, MapPin } from 'lucide-react';

const CATEGORIES = [
  { id: 'petine', name: 'Petiné', range: [Level.C], color: 'bg-rose-500', textColor: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'elementary', name: 'Elementary', range: [Level.D, Level.E, Level.F, Level.G], color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'middle', name: 'Middle', range: [Level.H, Level.I, Level.J, Level.K], color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'high', name: 'High', range: [Level.L, Level.M, Level.N], color: 'bg-slate-900', textColor: 'text-slate-600', bgColor: 'bg-slate-100' },
];

export const Step4Courses: React.FC<{ 
  station: any, 
  subjectIdx: number, 
  onToggle: (idx: number, code: string | string[], force?: boolean) => void 
}> = ({ station, subjectIdx, onToggle }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('petine');
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const subject = station?.subjects?.[subjectIdx];

  const activeCategory = useMemo(() => 
    CATEGORIES.find(c => c.id === activeCategoryId) || CATEGORIES[0]
  , [activeCategoryId]);

  const toggleAllInCategory = (modalitySuffix: string, shouldAdd: boolean) => {
    if (!subject) return;
    
    const codesToToggle: string[] = [];
    activeCategory.range.forEach(levelLetter => {
      numbers.forEach(n => {
        const code = `${levelLetter}${n}-${modalitySuffix}`;
        codesToToggle.push(code);
      });
    });
    
    if (codesToToggle.length > 0) {
      onToggle(subjectIdx, codesToToggle, shouldAdd);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={18} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Configuración de Grupos</span>
          </div>
          <h4 className="font-black text-slate-800 text-3xl tracking-tight">Cursos y Modalidades</h4>
          <p className="text-slate-400 text-sm font-bold mt-1">Defina qué grupos pertenecen a la materia {subject?.name || 'sin seleccionar'}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategoryId === cat.id 
                  ? `${cat.color} text-white shadow-lg scale-105` 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {[ 
          { mod: Modality.RS, suffix: 'M', color: 'primary', icon: MapPin, title: 'Renfort En Sede', badgeColor: 'bg-blue-100 text-blue-700' },
          { mod: Modality.RC, suffix: 'C', color: 'orange', icon: Home, title: 'Renfort En Casa', badgeColor: 'bg-orange-100 text-orange-700' }
        ].map(config => (
          <div key={config.suffix} className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
            <div className={`p-6 border-b border-slate-50 flex items-center justify-between ${config.suffix === 'M' ? 'bg-blue-50/30' : 'bg-orange-50/30'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-white ${config.suffix === 'M' ? 'text-primary' : 'text-orange-600'}`}>
                  <config.icon size={24} />
                </div>
                <div>
                  <h5 className="font-black text-slate-800 text-lg leading-tight">{config.title}</h5>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sufijo: -{config.suffix}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleAllInCategory(config.suffix, true)}
                  className="text-[9px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  Activar Cat.
                </button>
                <button 
                  onClick={() => toggleAllInCategory(config.suffix, false)}
                  className="text-[9px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                >
                  Limpiar Cat.
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
              {activeCategory.range.map(levelChar => (
                <div key={levelChar} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      {levelChar}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel {levelChar}</span>
                    <div className="flex-1 h-[1px] bg-slate-100"></div>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {numbers.map(n => {
                      // Fix: Changed levelLetter to levelChar to correctly reference the loop variable
                      const code = `${levelChar}${n}-${config.suffix}`;
                      const active = subject?.courses?.includes(code);
                      return (
                        <button
                          key={code}
                          onClick={() => onToggle(subjectIdx, code)}
                          className={`group relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            active 
                              ? (config.suffix === 'M' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-orange-600 border-orange-600 text-white shadow-lg') 
                              : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-black">{levelChar}{n}</span>
                          <span className="text-[8px] font-bold opacity-60">-{config.suffix}</span>
                          {active && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-green-500 rounded-full p-0.5 shadow-sm">
                              <CheckCircle2 size={12} fill="currentColor" className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-2">
              <LayoutGrid size={12} className="text-slate-300" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Seleccione los grupos para habilitar en el libro de notas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
