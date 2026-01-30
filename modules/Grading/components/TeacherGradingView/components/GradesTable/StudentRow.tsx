import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { GradeSlot, Section, Station, Student } from '../../../../../../types';

interface StudentRowProps {
  student: Student & { results?: { moments: Record<string, number>; final: number } };
  station: Station;
  selectedSubjectId: string;
  momentAverages: Record<string, number>;
  finalAverage: number;
  getGradeValue: (studentId: string, slotId: string, subjectId: string) => string;
  onGradeChange: (studentId: string, slotId: string, subjectId: string, value: string) => void;
}

const getAllSlots = (section: Section): GradeSlot[] => {
  return section.gradeSlots || [];
};

export const StudentRow: React.FC<StudentRowProps> = React.memo(
  ({
    student,
    station,
    selectedSubjectId,
    momentAverages,
    finalAverage,
    getGradeValue,
    onGradeChange
  }) => {
    const isConsolidated = finalAverage >= 3.7;

    const handleInputChange = (slotId: string, value: string) => {
      if (value === '') {
        onGradeChange(student.id, slotId, "global", '');
        return;
      }
      // Validación estricta: solo 1 o 5
      if (value === '1' || value === '5') {
        onGradeChange(student.id, slotId, "global", value);
      }
    };

    return (
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="p-6 sticky left-0 z-10 bg-white border-r border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center font-black text-xs">
              {student.full_name?.charAt(0)}
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {student.full_name}
            </p>
          </div>
        </td>

        {station.moments?.map(moment => {
          const momentAvg = momentAverages[moment.id] ?? 0;

          return (
            <React.Fragment key={moment.id}>
              {moment.sections?.map(section =>
                getAllSlots(section).map(slot => (
                  <td
                    key={`${student.id}-${slot.id}`}
                    className="p-2 border-r border-slate-50 w-20"
                  >
                    <input
                      type="text"
                      maxLength={1}
                      placeholder="-"
                      value={getGradeValue(student.id, slot.id, "global") || ''}
                      onChange={e => handleInputChange(slot.id, e.target.value)}
                      className="w-full text-center py-2 rounded-xl text-sm font-black border-2 border-slate-100 focus:border-secondary outline-none transition-all bg-white shadow-sm text-black"
                    />
                  </td>
                ))
              )}

              <td className="p-2 border-r border-slate-50 w-20 bg-slate-50/50">
                <div
                  className={`text-center text-xs font-black ${
                    momentAvg >= 3.7 ? 'text-green-600' : 'text-slate-400'
                  }`}
                >
                  {momentAvg > 0 ? momentAvg.toFixed(1) : '-'}
                </div>
              </td>
            </React.Fragment>
          );
        })}

        <td className="p-6 text-center font-black bg-blue-50/30 border-l min-w-[80px]">
          <span className={`text-lg ${finalAverage >= 3.7 ? 'text-primary' : 'text-slate-500'}`}>
            {finalAverage > 0 ? finalAverage.toFixed(1) : '0.0'}
          </span>
        </td>

        <td className="p-6 text-center border-l bg-slate-50/30">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
              isConsolidated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isConsolidated ? (
              <><CheckCircle size={12} /> Consolidado</>
            ) : (
              <><AlertCircle size={12} /> No Consolidado</>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

StudentRow.displayName = 'StudentRow';