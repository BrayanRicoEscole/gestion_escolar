import React from 'react';
import { Station } from '../../../../types';
import { TableHeader } from './TableHeader';
import { StudentRow } from './StudentRow';

interface GradesTableProps {
  station: Station;
  students: any[];
  selectedSubjectId: string;
  selectedCourse: string;
  getGradeValue: (studentId: string, slotId: string, subjectId: string) => string;
  onGradeChange: (studentId: string, slotId: string, subjectId: string, value: string) => void;
  collapsedMoments: Set<string>;
  onToggleMoment: (id: string) => void;
  isEditable: boolean;
  onToggleSkill: (studentId: string, skillId: string) => void;
  getSkillSelectionsForStudent: (studentId: string) => string[];
}

export const GradesTable: React.FC<GradesTableProps> = React.memo(({
  station,
  students,
  selectedSubjectId,
  selectedCourse,
  getGradeValue,
  onGradeChange,
  collapsedMoments,
  onToggleMoment,
  isEditable,
  onToggleSkill,
  getSkillSelectionsForStudent
}) => {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm custom-scrollbar">
      <table className="min-w-full border-separate border-spacing-0">
        <TableHeader
          station={station}
          selectedSubjectId={selectedSubjectId}
          collapsedMoments={collapsedMoments}
          onToggleMoment={onToggleMoment}
        />
        <tbody>
          {students.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              station={station}
              selectedSubjectId={selectedSubjectId}
              selectedCourse={selectedCourse}
              momentAverages={student.results?.moments ?? {}}
              finalAverage={student.results?.final ?? 0}
              getGradeValue={getGradeValue}
              onGradeChange={onGradeChange}
              collapsedMoments={collapsedMoments}
              isEditable={isEditable}
              selectedSkillIds={getSkillSelectionsForStudent(student.id)}
              onToggleSkill={onToggleSkill}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

GradesTable.displayName = 'GradesTable';