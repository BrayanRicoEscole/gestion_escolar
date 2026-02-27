import React, { useState } from 'react';
import {
  X,
  UserCircle,
  History,
} from 'lucide-react';
import { Student } from 'types';
import { Button } from '../../../components/ui/Button';
import { InfoTab } from './StudentModal/InfoTab';
import { HistoryTab } from './StudentModal/HistoryTab';
import { RetireDialog } from './StudentModal/RetireDialog';

interface Props {
  student: Student;
  onClose: () => void;
}

type Tab = 'info' | 'history';

export const StudentModal: React.FC<Props> = ({ student: initialStudent, onClose }) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 bg-primary text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-black border border-white/5">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-tight">
                {student.full_name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  ID: {student.document}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${student.estado_actual?.toLowerCase().includes('activo') ? 'bg-green-500' : 'bg-rose-500'}`}>
                  {student.estado_actual}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
             <button 
               onClick={() => setActiveTab('info')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white'}`}
             >
               <UserCircle className="inline mr-2" size={14} /> Ficha Personal
             </button>
             <button 
               onClick={() => setActiveTab('history')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white'}`}
             >
               <History className="inline mr-2" size={14} /> Historial Académico
             </button>
          </div>

          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50 text-black">
          {activeTab === 'info' ? (
            <InfoTab 
              student={student} 
              onRetireClick={() => setIsRetireModalOpen(true)} 
              onUpdate={(updated) => setStudent(updated)}
            />
          ) : (
            <HistoryTab student={student} />
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      {/* Retire Dialog */}
      {isRetireModalOpen && (
        <RetireDialog 
          student={student} 
          onClose={() => setIsRetireModalOpen(false)} 
          onSuccess={() => {
            setIsRetireModalOpen(false);
            onClose();
          }} 
        />
      )}
    </div>
  );
};
