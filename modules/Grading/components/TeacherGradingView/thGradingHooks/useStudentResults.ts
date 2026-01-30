import { useMemo } from 'react';
import { calculateStudentGrades } from '../Domain/gradeCalculator';

export function useStudentResults({
  students,
  station,
  subjectId,
  getGradeValue,
  consolidationFilter
}: any) {
  const studentsWithGrades = useMemo(() => {
    if (!station) return [];

    return students.map((s: any) => ({
      ...s,
      results: calculateStudentGrades({
        studentId: s.id,
        station,
        subjectId, // Se mantiene por firma pero el cálculo es global para los slots
        getGradeValue
      })
    }));
  }, [students, station, subjectId, getGradeValue]);

  return useMemo(() => {
    if (consolidationFilter === 'all') return studentsWithGrades;
    return studentsWithGrades.filter((s: any) => {
      const isConsolidated = (s.results?.final || 0) >= 3.7;
      return consolidationFilter === 'consolidated' ? isConsolidated : !isConsolidated;
    });
  }, [studentsWithGrades, consolidationFilter]);
}