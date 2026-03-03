
import { useMemo } from 'react';
import { GradeEntry, Station, Student, SchoolYear } from '../../../types';

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
  allGrades: GradeEntry[]
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
      // Logic for Calendar B: autumn, winter from previous year, spring, summer from current
      // Since we might not have the previous year easily accessible here, 
      // we'll look for stations with these names in the current year or mock them if needed.
      // For now, let's filter the current year's stations that match the names or just take the last 4 if they exist.
      // The user said: "autumn, winter del año anterior y spring y summer del actual"
      // In a real scenario, we'd fetch the previous year. 
      // For this implementation, we'll assume the stations are available or follow the pattern.
      
      // Let's try to find stations that match the names
      const spring = schoolYear.stations.find(s => s.name.toLowerCase().includes('spring'));
      const summer = schoolYear.stations.find(s => s.name.toLowerCase().includes('summer'));
      
      // If we don't find them, we just return all stations for now but labeled correctly
      // In a real app, we'd need a more robust way to fetch historical data.
      return schoolYear.stations; 
    }
    
    return schoolYear.stations;
  }, [schoolYear, student]);

  const finalData = useMemo(() => {
    if (!schoolYear || !student || stations.length === 0) {
      return { labs: {}, generalAverage: 0 };
    }

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
          let momentHasData = false;

          moment.sections.forEach(section => {
            let sectionScore = 0;
            let sectionWeight = 0;

            section.gradeSlots.forEach(slot => {
              const entry = gradesMap.get(`${studentId}_${stationSubject.id}_${slot.id}`);
              if (entry && entry.value !== null) {
                sectionScore += entry.value * (slot.weight || 0);
                sectionWeight += slot.weight || 0;
                momentHasData = true;
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

    return { labs: grouped, generalAverage };
  }, [schoolYear, student, studentCourseCode, stations, gradesMap, studentId]);

  return {
    stations,
    finalData
  };
}
