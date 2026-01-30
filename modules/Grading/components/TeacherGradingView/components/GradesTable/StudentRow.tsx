import { CheckCircle, AlertCircle, Lock, Award, Target, X } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { GradeSlot, Section, Station, Student, Skill, Level } from '../../../../../../types';

interface StudentRowProps {
  student: Student & { results?: { moments: Record<string, number>; final: number } };
  station: Station;
  selectedSubjectId: string;
  selectedCourse: string;
  momentAverages: Record<string, number>;
  finalAverage: number;
  getGradeValue: (studentId: string, slotId: string, subjectId: string) => string;
  onGradeChange: (studentId: string, slotId: string, subjectId: string, value: string) => void;
  collapsedMoments: Set<string>;
  isEditable: boolean;
  selectedSkillIds: string[]; // Recibido del hook global
  onToggleSkill: (studentId: string, skillId: string) => void;
}

const getAllSlots = (section: Section): GradeSlot[] => {
  return section.gradeSlots || [];
};

export const StudentRow: React.FC<StudentRowProps> = React.memo(
  ({
    student,
    station,
    selectedSubjectId,
    selectedCourse,
    momentAverages,
    finalAverage,
    getGradeValue,
    onGradeChange,
    collapsedMoments,
    isEditable,
    selectedSkillIds,
    onToggleSkill
  }) => {
    const [showSkillSelector, setShowSkillSelector] = useState(false);

    const isConsolidated = finalAverage >= 3.7;
    const currentSubject = station.subjects?.find(s => s.id === selectedSubjectId);
    
    const currentLevel = useMemo(() => {
        if (!selectedCourse) return null;
        const firstChar = selectedCourse.charAt(0).toUpperCase();
        return Object.values(Level).find(l => l === firstChar) || null;
    }, [selectedCourse]);

    const skills = useMemo(() => {
        if (!currentSubject?.skills || !currentLevel) return [];
        return currentSubject.skills.filter(s => s.level === currentLevel);
    }, [currentSubject, currentLevel]);

    const handleInputChange = (slotId: string, value: string) => {
      if (!isEditable) return;
      if (value === '' || value === '1' || value === '5') {
        onGradeChange(student.id, slotId, selectedSubjectId, value);
      }
    };

    return (
      <tr className="hover:bg-slate-50 transition-colors group">
        <td className="p-6 sticky left-0 z-20 bg-white border-r border-slate-50 shadow-[4px_0_8px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center font-black text-xs relative overflow-hidden shrink-0">
              {student.full_name?.charAt(0)}
              {!isEditable && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center text-rose-500"><Lock size={12} /></div>}
            </div>
            <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{student.full_name}</p>
          </div>
        </td>

        {station.moments?.map(moment => {
          const isCollapsed = collapsedMoments.has(moment.id);
          const momentAvg = momentAverages[moment.id] ?? 0;

          return (
            <React.Fragment key={moment.id}>
              {!isCollapsed ? (
                <React.Fragment>
                  {moment.sections?.map(section =>
                    getAllSlots(section).map(slot => (
                      <td key={`${student.id}-${slot.id}`} className="p-2 border-r border-slate-50 w-20 text-center">
                        <input
                          type="text"
                          maxLength={1}
                          placeholder="-"
                          disabled={!isEditable}
                          value={getGradeValue(student.id, slot.id, selectedSubjectId) || ''}
                          onChange={e => handleInputChange(slot.id, e.target.value)}
                          className={`w-full text-center py-2 rounded-xl text-sm font-black border-2 outline-none transition-all shadow-sm ${
                            !isEditable ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-100 focus:border-secondary text-black'
                          }`}
                        />
                      </td>
                    ))
                  )}
                  <td className="p-2 border-r border-slate-50 w-20 bg-slate-50/50 text-center">
                    <div className={`text-[13px] font-black ${momentAvg >= 3.7 ? 'text-green-600' : 'text-slate-500'}`}>
                      {momentAvg > 0 ? momentAvg.toFixed(1) : '-'}
                    </div>
                  </td>
                </React.Fragment>
              ) : (
                <td className="p-2 border-r border-slate-50 text-center bg-slate-50/80 min-w-[80px]">
                  <div className={`text-sm font-black ${momentAvg >= 3.7 ? 'text-green-600' : 'text-slate-500'}`}>
                    {momentAvg > 0 ? momentAvg.toFixed(1) : '-'}
                  </div>
                </td>
              )}
            </React.Fragment>
          );
        })}

        <td className="p-6 text-center font-black bg-blue-50/30 border-l min-w-[80px]">
          <span className={`text-xl ${finalAverage >= 3.7 ? 'text-primary' : 'text-slate-500'}`}>
            {finalAverage > 0 ? finalAverage.toFixed(1) : '0.0'}
          </span>
        </td>

        <td className="p-6 text-center border-l bg-slate-50/30">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${isConsolidated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {isConsolidated ? <><CheckCircle size={12} /> Consolidado</> : <><AlertCircle size={12} /> No Cons.</>}
          </div>
        </td>

        <td className="p-4 text-center border-l bg-slate-50/10 min-w-[180px] relative">
          <button 
            onClick={() => setShowSkillSelector(!showSkillSelector)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all w-full justify-between ${selectedSkillIds.length > 0 ? 'border-primary/20 bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-400'}`}
          >
            <div className="flex items-center gap-2">
               <Award size={14} />
               <span className="text-[10px] font-black uppercase tracking-tighter">
                 {selectedSkillIds.length} Habilidades
               </span>
            </div>
          </button>

          {showSkillSelector && (
            <div className="absolute top-full right-0 z-50 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-in slide-in-from-top-2 duration-200">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Habilidades</span>
                      <span className="text-[9px] font-bold text-primary uppercase">Nivel {currentLevel}</span>
                  </div>
                  <button onClick={() => setShowSkillSelector(false)} className="text-slate-300 hover:text-slate-900"><X size={16} /></button>
               </div>
               <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {skills.length > 0 ? skills.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => onToggleSkill(student.id, skill.id)}
                      className={`w-full text-left p-3 rounded-2xl text-[10px] font-bold transition-all border-2 ${selectedSkillIds.includes(skill.id) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'}`}
                    >
                      {skill.description}
                    </button>
                  )) : (
                    <div className="text-center py-6">
                        <Target size={24} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sin habilidades para el Grado {currentLevel}</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </td>
      </tr>
    );
  }
);

StudentRow.displayName = 'StudentRow';