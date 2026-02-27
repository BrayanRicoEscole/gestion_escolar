import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, UserMinus } from 'lucide-react';
import { Student } from 'types';
import { retireStudent, getSchoolYearsList } from '../../../../services/api';

interface RetireDialogProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

export const RetireDialog: React.FC<RetireDialogProps> = ({ student, onClose, onSuccess }) => {
  const [isRetiring, setIsRetiring] = useState(false);
  const [retireReason, setRetireReason] = useState('Retiro Voluntario');
  const [retireObs, setRetireObs] = useState('');
  const [years, setYears] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getSchoolYearsList().then(setYears);
  }, []);

  const handleRetireConfirm = async () => {
    if (!student.id || !years.length) return;
    setIsRetiring(true);
    try {
      await retireStudent({
        studentId: student.id,
        schoolYearId: years[0].id, // Asumimos el año actual
        status: retireReason,
        observations: retireObs,
        currentGrade: student.grade || 'N/A',
        currentLevel: student.academic_level || 'N/A',
        currentAtelier: student.atelier || 'N/A',
        currentModality: student.modality || 'N/A'
      });
      alert("Estudiante retirado exitosamente.");
      onSuccess();
    } catch (e) {
      alert("Error al procesar el retiro.");
    } finally {
      setIsRetiring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
         <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
         </div>
         <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Retirar Seed de la Institución</h3>
         <p className="text-slate-500 text-sm mb-8">Esta acción actualizará el estado del estudiante y generará un registro en su historial académico.</p>
         
         <div className="space-y-6">
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Causa del Retiro</label>
               <select 
                 value={retireReason}
                 onChange={e => setRetireReason(e.target.value)}
                 className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-rose-100 outline-none"
               >
                 <option>Retiro Voluntario</option>
                 <option>Retiro Académico</option>
                 <option>Retiro Disciplinario</option>
                 <option>Graduado / Egresado</option>
                 <option>Otros</option>
               </select>
            </div>

            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Observaciones / Motivo detallado</label>
               <textarea 
                 value={retireObs}
                 onChange={e => setRetireObs(e.target.value)}
                 className="w-full p-5 bg-slate-50 border-none rounded-2xl font-medium text-sm text-black focus:ring-4 focus:ring-rose-100 resize-none h-32 outline-none"
                 placeholder="Explique brevemente el contexto del retiro..."
               />
            </div>
         </div>

         <div className="flex gap-4 mt-10">
            <button 
              onClick={onClose}
              className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]"
            >
              Cancelar
            </button>
            <button 
              onClick={handleRetireConfirm}
              disabled={isRetiring}
              className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
            >
              {isRetiring ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
              Confirmar Retiro
            </button>
         </div>
      </div>
    </div>
  );
};
