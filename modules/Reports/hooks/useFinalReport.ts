
import { useMemo } from 'react';
import { GradeEntry, Station, Student, SchoolYear, StudentComment } from '../../../types';

interface StationResult {
  id: string;
  name: string;
  average: number;
  hasData: boolean;
}

export interface FinalReportSubject {
  subject: any;
  stationResults: StationResult[];
  finalYearAvg: number;
}

function buildGradesMap(grades: GradeEntry[]) {
  const map = new Map<string, GradeEntry>();
  grades.forEach(g => {
    map.set(`${g.studentId}_${g.subjectId}_${g.slotId}`, g);
  });
  return map;
}

export function useFinalReport(
  schoolYear: SchoolYear | null,
  student: Student | null,
  allGrades: GradeEntry[],
  allComments: StudentComment[] = []
) {
  const studentId = student?.id;

  const gradesMap = useMemo(
    () => buildGradesMap(allGrades),
    [allGrades]
  );

  const studentCourseCode = useMemo(() => {
    if (!student) return '';
    const modality = student.modality || '';
    const isSede = modality === 'RS' || modality.includes('Sede') || modality.includes('(RS)');
    const suffix = isSede ? 'M' : 'C';
    return `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
  }, [student]);

  const stations = useMemo(() => {
    if (!schoolYear || !student) return [];
    
    const calType = student.calendario || 'A';
    
    if (calType === 'A') {
      return schoolYear.stations;
    } else if (calType === 'B') {
      return schoolYear.stations; 
    }
    
    return schoolYear.stations;
  }, [schoolYear, student]);

  const finalData = useMemo(() => {
    if (!schoolYear || !student || stations.length === 0) {
      return { labs: {}, generalAverage: 0, convivenciaResults: [] };
    }

    // Convivencia per station
    const convivenciaResults = stations.map(station => {
      const comment = allComments.find(c => c.studentId === studentId && c.stationId === station.id);
      return {
        id: station.id,
        name: station.name,
        average: comment?.convivenciaGrade || 0,
        hasData: (comment?.convivenciaGrade || 0) > 0
      };
    });

    // We need to find all unique subjects across all stations
    const allSubjectsMap = new Map<string, any>();
    stations.forEach(station => {
      station.subjects.forEach(subject => {
        if (subject.courses?.some(c => c.trim().toUpperCase() === studentCourseCode)) {
          allSubjectsMap.set(subject.name, subject); // Use name as key to group same subjects across stations
        }
      });
    });

    const subjects = Array.from(allSubjectsMap.values());

    const reportSubjects: FinalReportSubject[] = subjects.map(subject => {
      const stationResults: StationResult[] = stations.map(station => {
        // Find the subject in this specific station (by name)
        const stationSubject = station.subjects.find(s => s.name === subject.name);
        
        if (!stationSubject) {
          return { id: station.id, name: station.name, average: 0, hasData: false };
        }

        let totalWeighted = 0;
        let totalWeight = 0;
        let hasData = false;

        station.moments.forEach(moment => {
          let momentWeighted = 0;
          let momentWeight = 0;

          moment.sections.forEach(section => {
            let sectionScore = 0;
            let sectionWeight = 0;

            section.gradeSlots.forEach(slot => {
              const entry = gradesMap.get(`${studentId}_${stationSubject.id}_${slot.id}`);
              if (entry && entry.value !== null) {
                sectionScore += entry.value * (slot.weight || 0);
                sectionWeight += slot.weight || 0;
                hasData = true;
              }
            });

            const sectionAvg = sectionWeight > 0 ? sectionScore / sectionWeight : 0;
            momentWeighted += sectionAvg * (section.weight || 0);
            momentWeight += section.weight || 0;
          });

          const momentAvg = momentWeight > 0 ? momentWeighted / momentWeight : 0;
          totalWeighted += momentAvg * (moment.weight || 0);
          totalWeight += moment.weight || 0;
        });

        return {
          id: station.id,
          name: station.name,
          average: totalWeight > 0 ? totalWeighted / totalWeight : 0,
          hasData
        };
      });

      const finalYearAvg = stationResults.reduce((acc, sr) => {
        const station = stations.find(s => s.id === sr.id);
        const weight = station?.weight || 0;
        return acc + (sr.average * (weight / 100));
      }, 0);

      return { subject, stationResults, finalYearAvg };
    });

    const grouped: Record<string, FinalReportSubject[]> = {};
    reportSubjects.forEach(item => {
      const lab = item.subject.lab || 'General';
      if (!grouped[lab]) grouped[lab] = [];
      grouped[lab].push(item);
    });

    const validSubjects = reportSubjects.filter(r => r.finalYearAvg > 0);
    const generalAverage = validSubjects.length > 0 
      ? validSubjects.reduce((acc, r) => acc + r.finalYearAvg, 0) / validSubjects.length
      : 0;

    return { labs: grouped, generalAverage, convivenciaResults };
  }, [schoolYear, student, studentCourseCode, stations, gradesMap, studentId, allComments]);

  return {
    stations,
    finalData
  };
}
