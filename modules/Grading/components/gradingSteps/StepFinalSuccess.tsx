import React from 'react';
import {CheckCircle2, ArrowRight} from 'lucide-react'

export const StepFinalSuccess: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="text-center py-24 animate-in fade-in duration-500">
    <div className="w-32 h-32 bg-green-100 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-green-600 shadow-2xl">
      <CheckCircle2 size={64} />
    </div>
    <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">¡Configuración Finalizada!</h3>
    <p className="text-slate-500 mb-12 max-w-lg mx-auto text-lg font-medium">Año Escolar parametrizado correctamente. Sincronza los cambios para guardar</p>
    <button onClick={onReset} className="px-10 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl mx-auto">
      Volver al Inicio <ArrowRight size={22} />
    </button>
  </div>
);