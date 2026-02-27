import React, { useState } from 'react';
import { UserMinus, Edit3 } from 'lucide-react';
import { Student } from 'types';
import { 
  AcademicSection, 
  PersonalSection, 
  InstitutionalSection, 
  GuardianMainSection, 
  GuardianSecondarySection, 
  FinancialSection, 
  HealthSection 
} from './Sections';
import { EditStudentForm } from './EditStudentForm';

interface InfoTabProps {
  student: Student;
  onRetireClick: () => void;
  onUpdate: (updatedStudent: Student) => void;
}

export const InfoTab: React.FC<InfoTabProps> = ({ student, onRetireClick, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isStudentActive = student.estado_actual?.toLowerCase().includes('activo');

  if (isEditing) {
    return (
      <EditStudentForm 
        student={student} 
        onClose={() => setIsEditing(false)} 
        onSuccess={(updated) => {
          onUpdate(updated);
          setIsEditing(false);
        }} 
      />
    );
  }

  return (
    <div className="animate-in slide-in-from-left-4 duration-300">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <Edit3 size={14} /> Editar Información
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AcademicSection student={student} />
        <PersonalSection student={student} />
        <InstitutionalSection student={student} />
        <GuardianMainSection student={student} />
        <GuardianSecondarySection student={student} />
        <FinancialSection student={student} />
        <HealthSection student={student} />
      </div>
      
      {/* Admin Actions Area */}
      {isStudentActive && (
        <div className="mt-20 pt-10 border-t border-slate-200">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Gestión de Matrícula (Admin)</h4>
          <button 
            onClick={onRetireClick}
            className="flex items-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm"
          >
            <UserMinus size={18} /> Retirar Estudiante de la Institución
          </button>
        </div>
      )}
    </div>
  );
};
