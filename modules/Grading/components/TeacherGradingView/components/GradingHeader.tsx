
import React from 'react';
import { CloudCheck, CloudUpload, Zap, Lock, Unlock, CheckCircle } from 'lucide-react';

interface GradingHeaderProps {
  subjectName: string;
  isSaving: boolean;
  saveSuccess?: boolean;
  isEditable?: boolean;
}

export const GradingHeader: React.FC<GradingHeaderProps> = ({
  subjectName,
  isSaving,
  isEditable = true
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          Libro de Calificaciones
        </h1>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          isEditable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {isEditable ? <Unlock size={12} /> : <Lock size={12} />}
          {isEditable ? 'Edición Abierta' : 'Bloqueado'}
        </div>
      </div>
      
      <p className="text-slate-500 font-medium">
        Materia: <span className="text-primary font-bold">{subjectName || 'Sin materia'}</span>
      </p>
      
      <div className="flex gap-4 items-center mt-5 h-12">
        {/* Status de Sincronización */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-500 ${
          isSaving 
            ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' 
            : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          {isSaving ? (
             <>
               <CloudUpload size={18} className="animate-bounce" />
               <span className="text-[10px] font-black uppercase tracking-widest">Guardando cambios...</span>
             </>
          ) : (
            <>
              <CloudCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Nube Sincronizada</span>
            </>
          )}
        </div>

        {/* Indicador de Realtime */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
           <Zap size={14} className="text-primary fill-primary/20 animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-tighter">Motor Realtime Activo</span>
        </div>

        {!isEditable && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <span className="text-[10px] font-black uppercase tracking-widest">Solo Lectura</span>
          </div>
        )}
      </div>
    </div>
  );
};

GradingHeader.displayName = 'GradingHeader';
