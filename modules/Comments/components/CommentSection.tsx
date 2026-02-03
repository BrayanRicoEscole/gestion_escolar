
import React, { useMemo, memo } from 'react';
import { Brain, Loader2, Sparkles, Zap, Award, X, Check } from 'lucide-react';
import { StudentComment, CommentTemplate, CommentStatus } from 'types';
import { TemplatePicker } from './TemplatePicker';

export interface CommentFieldConfig {
  key: keyof StudentComment;
  label: string;
  templateKey: string;
}

interface CommentSectionProps {
  currentComment: StudentComment;
  handleAIAction: () => void;
  isAnalyzing: boolean;
  isEditable: boolean;
  aiSuggestion: string;
  analysis: string; 
  showAISuggestion: boolean;
  onAcceptAISuggestion: () => void;
  onDiscardAISuggestion: () => void;
  updateField: (field: keyof StudentComment, value: any) => void;
}


export const CommentSection: React.FC<CommentSectionProps> = memo(
  ({
    currentComment,
  handleAIAction,
  isAnalyzing,
  isEditable,
  showAISuggestion,
  aiSuggestion,
  analysis, 
  onAcceptAISuggestion,
  onDiscardAISuggestion,
  updateField
  }) => {
      const realWordCount = useMemo(() => {
    const text = currentComment?.comentary || '';
    return text.split(/\s+/).filter(w => w.length > 3).length;
  }, [currentComment?.comentary]);

    return (
      <div> {/* Síntesis Final e IA */}
              <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl relative">
                <div className="bg-slate-900 text-white p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-secondary border border-white/5 shadow-inner">
                      <Brain size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Comentario de cierre</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={currentComment.comentaryStatus} />
                        {currentComment.comentaryQuality ? <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/5 text-xs font-black text-amber-400"><Award size={14} /> Calidad IA: {currentComment.comentaryQuality}/10</div> : null}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAIAction} disabled={isAnalyzing || !isEditable} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-2xl active:scale-95 disabled:opacity-30 ${isAnalyzing ? 'bg-slate-700 animate-pulse' : 'bg-secondary hover:bg-secondary-hover text-white'}`}>
                    {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} 
                    {currentComment.comentary ? 'Validar con Mentor IA' : 'Redactar con Mentor IA'}
                  </button>
                </div>

                <div className="p-10 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comentario</label>
                      <p className="text-[11px] text-slate-500 font-medium italic">Destacando el proceso integral del Seed</p>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ${realWordCount < 350 ? 'text-rose-500' : 'text-green-600'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">Palabras Reales</span>
                      <span className="text-2xl font-black tracking-tighter">{realWordCount} / 350</span>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea value={currentComment.comentary || ''} onChange={e => updateField('comentary', e.target.value)} disabled={!isEditable} placeholder="Escriba la síntesis o use el Mentor IA para un borrador pedagógico..." className={`w-full min-h-[400px] p-10 rounded-[2.5rem] bg-slate-50 border-2 text-black text-base font-semibold leading-relaxed outline-none transition-all ${!isEditable ? 'opacity-50 italic' : 'focus:bg-white focus:border-primary/20 shadow-inner'}`} />
                    
                    {showAISuggestion && aiSuggestion && (
                      <div className="absolute inset-x-8 bottom-8 bg-white border border-secondary/20 rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom-8 duration-500 z-10">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3"><Zap size={20} className="text-secondary" /><h4 className="font-black text-slate-800 text-sm">Análisis del texto</h4></div>
                          
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                          <p className="text-sm text-black leading-relaxed italic">{analysis}</p>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3"><Zap size={20} className="text-secondary" /><h4 className="font-black text-slate-800 text-sm">Propuesta de la IA</h4></div>
                          
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                          <p className="text-sm text-black leading-relaxed italic">{aiSuggestion}</p>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={onDiscardAISuggestion}>Descartar</button>
                          <button onClick={onAcceptAISuggestion}>Aceptar y Aplicar</button>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section></div>
    );
  }
);

const StatusBadge = ({ status }: { status?: CommentStatus }) => {
  const configs: Record<CommentStatus, { label: string; color: string }> = {
    draft: { label: 'Borrador', color: 'bg-slate-500/20 text-slate-400' },
    analyzed: { label: 'Analizado por IA', color: 'bg-blue-500/20 text-blue-400' },
    improved: { label: 'Optimizado', color: 'bg-secondary/20 text-secondary' },
    approved: { label: 'Aprobado', color: 'bg-green-500/20 text-green-400' },
    rejected: { label: 'Rechazado', color: 'bg-rose-500/20 text-rose-400' },
  };
  const config = configs[status || 'draft'];
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 ${config.color}`}>{config.label}</span>;
};


CommentSection.displayName = 'CommentSection';
