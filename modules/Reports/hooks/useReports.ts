
import { useMemo } from 'react';
import { GradeEntry, Station, SkillSelection, Student } from '../../../../types';

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
  student: Student | null,
  grades: GradeEntry[],
  skillSelections: SkillSelection[] = []
) {
  const studentId = student?.id;

  const studentGrades = useMemo(
    () => grades.filter(g => g.studentId === studentId),
    [grades, studentId]
  );

  const gradesMap = useMemo(
    () => buildGradesMap(studentGrades),
    [studentGrades]
  );

  // Determinar el código de curso del estudiante para filtrar materias
  const studentCourseCode = useMemo(() => {
    if (!student) return '';
    const modality = student.modality || '';
    const isSede = modality === 'RS' || modality.includes('Sede') || modality.includes('(RS)');
    const suffix = isSede ? 'M' : 'C';
    return `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
  }, [student]);

  const reportData = useMemo<ReportSubject[]>(() => {
    if (!station || !student) return [];

    const momentWeightMap = new Map(
      station.moments.map(m => [m.id, m.weight || 0])
    );

    // FILTRO CRÍTICO: Solo materias que tengan el curso del estudiante en su configuración
    const enrolledSubjects = station.subjects.filter(subject => 
      subject.courses?.some(c => c.trim().toUpperCase() === studentCourseCode)
    );

    return enrolledSubjects.map(subject => {
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
  }, [station, student, studentCourseCode, gradesMap, skillSelections, studentId]);

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
