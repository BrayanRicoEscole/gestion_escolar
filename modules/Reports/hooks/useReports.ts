
import { useMemo } from 'react';
import { GradeEntry, Station, SkillSelection } from '../../../../types';

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
  selectedSkills: string[];
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
  grades: GradeEntry[],
  skillSelections: SkillSelection[] = []
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
      // 1. Calcular resultados por momento
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

      // 2. Resolver descripciones de habilidades seleccionadas
      const studentSkillIds = skillSelections
        .filter(s => s.studentId === studentId && s.subjectId === subject.id && s.stationId === station.id)
        .map(s => s.skillId);

      const selectedSkills = (subject.skills || [])
        .filter((sk: any) => studentSkillIds.includes(sk.id))
        .map((sk: any) => sk.description);

      return { subject, momentResults, finalStationAvg, selectedSkills };
    });
  }, [station, gradesMap, skillSelections, studentId]);

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
