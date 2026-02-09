import { useMemo } from 'react';
import { GradeEntry, Station } from '../../../../types';

interface MomentResult {
  id: string;
  name: string;
  average: number;
  hasData: boolean;
}

export interface ReportSubject {
  subject: any;
  momentResults: MomentResult[];
  finalStationAvg: number;
}

function buildGradesMap(grades: GradeEntry[]) {
  const map = new Map<string, GradeEntry>();
  grades.forEach(g => {
    map.set(`${g.subjectId}_${g.slotId}`, g);
  });
  return map;
}

export function useReport(
  station: Station | null,
  studentId: string,
  grades: GradeEntry[]
) {
  const studentGrades = useMemo(
    () => grades.filter(g => g.studentId === studentId),
    [grades, studentId]
  );

  const gradesMap = useMemo(
    () => buildGradesMap(studentGrades),
    [studentGrades]
  );

  const reportData = useMemo<ReportSubject[]>(() => {
    if (!station) return [];

    const momentWeightMap = new Map(
      station.moments.map(m => [m.id, m.weight || 0])
    );

    return station.subjects.map(subject => {
      const momentResults: MomentResult[] = station.moments.map(moment => {
        let totalWeighted = 0;
        let totalWeight = 0;
        let hasData = false;

        moment.sections.forEach(section => {
          let sectionScore = 0;
          let sectionWeight = 0;

          section.gradeSlots.forEach(slot => {
            const entry = gradesMap.get(`${subject.id}_${slot.id}`);
            if (entry && entry.value !== null) {
              sectionScore += entry.value * (slot.weight || 0);
              sectionWeight += slot.weight || 0;
              hasData = true;
            }
          });

          const sectionAvg =
            sectionWeight > 0 ? sectionScore / sectionWeight : 0;

          totalWeighted += sectionAvg * (section.weight || 0);
          totalWeight += section.weight || 0;
        });

        return {
          id: moment.id,
          name: moment.name,
          average: totalWeight > 0 ? totalWeighted / totalWeight : 0,
          hasData
        };
      });

      const finalStationAvg = momentResults.reduce((acc, m) => {
        const weight = momentWeightMap.get(m.id) || 0;
        return acc + m.average * (weight / 100);
      }, 0);

      return { subject, momentResults, finalStationAvg };
    });
  }, [station, gradesMap]);

  const generalAverage = useMemo(() => {
    if (!reportData.length) return 0;
    return (
      reportData.reduce((acc, r) => acc + r.finalStationAvg, 0) /
      reportData.length
    );
  }, [reportData]);

  const labs = useMemo(() => {
    const grouped: Record<string, ReportSubject[]> = {};
    reportData.forEach(item => {
      const lab = item.subject.lab || 'General';
      if (!grouped[lab]) grouped[lab] = [];
      grouped[lab].push(item);
    });
    return grouped;
  }, [reportData]);

  return {
    reportData,
    labs,
    generalAverage
  };
}
