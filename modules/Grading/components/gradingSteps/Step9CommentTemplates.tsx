
import React, { useState } from 'react';
import { PlusCircle, Trash2, Copy, MessageSquare, Zap, CheckCircle2, Sparkles, Layers, Brain, Heart, Users, Sprout } from 'lucide-react';
import { CommentTemplate, Level } from '../../../../types';

const COMMENT_FIELDS = [
  { key: 'academic_cons', label: 'Académico: Habilidades Consolidadas', color: 'border-blue-200 bg-blue-50', icon: Brain, iconColor: 'text-blue-500' },
  { key: 'academic_non', label: 'Académico: Habilidades No Consolidadas', color: 'border-blue-100 bg-blue-50/50', icon: Brain, iconColor: 'text-blue-400' },
  { key: 'emotional_skills', label: 'Emocional: Habilidades Socioemocionales', color: 'border-rose-200 bg-rose-50', icon: Heart, iconColor: 'text-rose-500' },
  { key: 'talents', label: 'Emocional: Talentos', color: 'border-rose-100 bg-rose-50/50', icon: Heart, iconColor: 'text-rose-400' },
  { key: 'social_interaction', label: 'Convivencial: Interacción y Cooperación', color: 'border-green-200 bg-green-50', icon: Users, iconColor: 'text-green-500' },
  { key: 'challenges', label: 'Convivencial: Desafíos', color: 'border-green-100 bg-green-50/50', icon: Users, iconColor: 'text-green-400' },
  { key: 'piar_desc', label: 'PIAR: Aplicación y Desarrollo', color: 'border-amber-200 bg-amber-50', icon: Sparkles, iconColor: 'text-amber-600' },
  { key: 'learning_crop_desc', label: 'Learning Crop: Vivencia de Aprendizaje', color: 'border-emerald-200 bg-emerald-50', icon: Sprout, iconColor: 'text-emerald-600' },
];

interface Step9Props {
  templates: CommentTemplate[];
  onAdd: (level: string, key: string) => void;
  onBulkAdd?: (levels: string[], key: string, content: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onClone?: (source: string, targets: string[]) => void;
}

export const Step9CommentTemplates: React.FC<Step9Props> = ({ 
  templates, onAdd, onBulkAdd, onRemove, onUpdate, onClone 
}) => {
  const [activeLevel, setActiveLevel] = useState<string>('C');
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['C']));
  const [sourceCloneLevel, setSourceCloneLevel] = useState<string>('');
  const [showCloneSuccess, setShowCloneSuccess] = useState(false);
  const [bulkTexts, setBulkTexts] = useState<Record<string, string>>({});

  const toggleLevelSelection = (lvl: string) => {
    const next = new Set(selectedLevels);
    if (next.has(lvl)) {
      if (next.size > 1) {
        next.delete(lvl);
        if (activeLevel === lvl) setActiveLevel(Array.from(next)[0]);
      }
    } else {
      next.add(lvl);
      setActiveLevel(lvl);
    }
    setSelectedLevels(next);
  };

  const handleClone = () => {
    if (!sourceCloneLevel || !onClone) return;
    const targets = Array.from(selectedLevels).filter(l => l !== sourceCloneLevel);
    if (targets.length === 0) return;
    onClone(sourceCloneLevel, targets);
    setShowCloneSuccess(true);
    setTimeout(() => setShowCloneSuccess(false), 3000);
  };

  const handleBulkAdd = (fieldKey: string) => {
    const text = bulkTexts[fieldKey];
    if (!text?.trim() || !onBulkAdd) return;
    onBulkAdd(Array.from(selectedLevels), fieldKey, text);
    setBulkTexts(prev => ({ ...prev, [fieldKey]: '' }));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner border border-white/5">
            <Zap size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Catálogo de Frases Pedagogicas</h3>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Gestión por niveles y campos de reporte</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-3 rounded-[2rem] border border-white/10">
          <div className="flex flex-col gap-1 px-3">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Clonar desde:</label>
            <select value={sourceCloneLevel} onChange={e => setSourceCloneLevel(e.target.value)} className="bg-transparent border-none text-sm font-black text-white focus:ring-0 cursor-pointer">
              <option value="" className="text-slate-900">Origen...</option>
              {Object.values(Level).map(lvl => <option key={lvl} value={lvl} className="text-slate-900">Nivel {lvl}</option>)}
            </select>
          </div>
          <button onClick={handleClone} disabled={!sourceCloneLevel || selectedLevels.size < 1} className="flex items-center gap-3 bg-secondary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-secondary-hover transition-all disabled:opacity-30 active:scale-95 shadow-lg">
            {showCloneSuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {showCloneSuccess ? 'Copiado' : 'Clonar a Selección'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Filtro de Niveles</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Level).map(lvl => (
                <button key={lvl} onClick={() => toggleLevelSelection(lvl)} className={`relative aspect-square rounded-xl text-lg font-black transition-all border-2 flex flex-col items-center justify-center ${selectedLevels.has(lvl) ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-100'}`}>
                  {lvl}
                  {templates.some(t => t.academicLevel === lvl) && !selectedLevels.has(lvl) && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full" />}
                </button>
              ))}
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase italic text-center">Seleccione los niveles para carga masiva</p>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          {COMMENT_FIELDS.map(field => {
            const activeLevelTemplates = templates.filter(t => t.academicLevel === activeLevel && t.fieldKey === field.key);
            return (
              <div key={field.key} className={`p-8 rounded-[2.5rem] border ${field.color} shadow-sm group/card`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <field.icon size={24} className={field.iconColor} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xl tracking-tight leading-tight">{field.label}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurando Nivel {activeLevel}</p>
                  </div>
                </div>

                <div className="mb-8 bg-white/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                   <div className="flex gap-4">
                      <textarea value={bulkTexts[field.key] || ''} onChange={e => setBulkTexts(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder="Añadir nueva frase estratégica..." className="flex-1 bg-white border-none p-4 text-sm font-semibold text-black rounded-2xl shadow-inner focus:ring-2 focus:ring-primary/10 min-h-[60px] resize-none" />
                      <button onClick={() => handleBulkAdd(field.key)} disabled={!bulkTexts[field.key]?.trim()} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-20 shrink-0">Guardar</button>
                   </div>
                </div>

                <div className="space-y-4">
                  {activeLevelTemplates.map((t, idx) => (
                    <div key={t.id} className="flex gap-4 group animate-in slide-in-from-top-2">
                      <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-start gap-5 shadow-sm group-hover:border-primary/30 transition-all">
                        <textarea value={t.content} onChange={e => onUpdate(t.id, e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:ring-0 min-h-[60px] resize-none leading-relaxed" />
                      </div>
                      <button onClick={() => onRemove(t.id)} className="p-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-2xl border border-slate-100 shadow-sm self-center hover:bg-rose-50"><Trash2 size={20} /></button>
                    </div>
                  ))}
                  {activeLevelTemplates.length === 0 && (
                    <div className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sin frases configuradas</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
