import React, { memo } from 'react';
import { ChevronRight, LayoutList } from 'lucide-react';
import { Student } from '../../../types'


interface StudentSidebarProps {
  students: Student[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = memo(
  ({ students, selectedId, onSelect }) => {
    return (
      <aside className="w-full lg:w-80 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden shrink-0">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Estudiantes ({students.length})
          </span>
          <LayoutList size={14} className="text-slate-300" />
        </div>

        {/* List */}
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {students.map(student => {
            const isSelected = student.id === selectedId;

            return (
              <button
                key={student.id}
                onClick={() => onSelect(student.id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${
                    isSelected
                      ? 'bg-white/20'
                      : 'bg-blue-50 text-primary'
                  }`}
                >
                  {student.full_name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 truncate">
                  <p className="font-bold text-[11px] truncate">
                    {student.full_name}
                  </p>
                  <div className="flex gap-1 items-center opacity-60 text-[9px] font-black">
                    {student.academic_level && (
                      <>
                        <span>{student.academic_level}</span>
                        <span>•</span>
                      </>
                    )}
                    {student.modality && <span>{student.modality}</span>}
                  </div>
                </div>

                {isSelected && <ChevronRight size={14} />}
              </button>
            );
          })}

          {students.length === 0 && (
            <div className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase italic">
              No hay estudiantes filtrados
            </div>
          )}
        </div>
      </aside>
    );
  }
);

StudentSidebar.displayName = 'StudentSidebar';
