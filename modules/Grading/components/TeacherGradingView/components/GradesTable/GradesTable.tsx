import React from 'react';
import { Station } from '../../../../types';
import { TableHeader } from './TableHeader';
import { StudentRow } from './StudentRow';

/* ===== Props ===== */

interface GradesTableProps {
  station: Station;
  students: any[];
  selectedSubjectId: string;

  getGradeValue: (
    studentId: string,
    slotId: string,
    subjectId: string
  ) => string | null;

  onGradeChange: (
    studentId: string,
    slotId: string,
    subjectId: string,
    value: string
  ) => void;
}

/* ===== Component ===== */

export const GradesTable: React.FC<GradesTableProps> =
  React.memo(
    ({
      station,
      students,
      selectedSubjectId,
      getGradeValue,
      onGradeChange
    }) => {
      return (
        <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full border-separate border-spacing-0">
            {/* ===== Header ===== */}
            <TableHeader
              station={station}
              selectedSubjectId={selectedSubjectId}
            />

            {/* ===== Body ===== */}
            <tbody>
              {students.map(student => (
                <StudentRow
                  key={student.id}
                  student={student}
                  station={station}
                  selectedSubjectId={selectedSubjectId}
                  momentAverages={student.results?.moments ?? {}}
                  finalAverage={student.results?.final ?? 0}
                  getGradeValue={getGradeValue}
                  onGradeChange={onGradeChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  );

GradesTable.displayName = 'GradesTable';