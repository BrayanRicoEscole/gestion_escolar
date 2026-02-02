
import { createClient } from '@supabase/supabase-js';
import { SchoolYear, Student, GradeEntry, SkillSelection, Subject, Skill, LevelingGrade } from '../types';
import { MOCK_INITIAL_SCHOOL_YEAR, MOCK_INITIAL_STUDENTS } from './mockInitialData';

const SUPABASE_URL = 'https://gzdiljudmdezdkntnhml.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGlsanVkbWRlemRrbnRuaG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzQ5OTEsImV4cCI6MjA4NTExMDk5MX0.Ui20tkVIXRslewslnM7vzDKkftdpxLnFBZn3KzoOue0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'api'
  }
});

const apiLogger = {
  logQuery: (operation: string, table: string, params?: any) => {
    console.groupCollapsed(
      `%c[DB QUERY] %c${operation} on %c${table}`,
      'color: #0f4899; font-weight: bold;',
      'color: #64748b; font-weight: normal;',
      'color: #0f172a; font-weight: bold;'
    );
    if (params) console.log('Payload:', params);
    console.groupEnd();
  },
  logResponse: (table: string, status: number, data: any, error: any) => {
    const isError = error || (status && status >= 400);
    const color = isError ? '#e11d48' : '#10b981';
    console.groupCollapsed(
      `%c[DB RESPONSE] %cTable: %c${table} %cStatus: %c${status}`,
      `color: ${color}; font-weight: bold;`,
      'color: #64748b; font-weight: normal;',
      `color: ${color}; font-weight: bold;`,
      'color: #64748b; font-weight: normal;',
      `color: ${color}; font-weight: bold;`
    );
    if (data) console.log('Returned Data:', data);
    if (error) console.error('Error Details:', error);
    console.groupEnd();
  }
};

const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

function mapSchoolYear(db: any): SchoolYear {
  return {
    id: db.id,
    name: db.name,
    stations: (db.stations || []).map((st: any) => ({
      id: st.id,
      name: st.name,
      weight: Number(st.weight || 0),
      startDate: st.start_date,
      endDate: st.end_date,
      moments: (st.learning_moments || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((m: any) => ({
          id: m.id,
          name: m.name,
          weight: Number(m.weight || 0),
          sections: (m.sections || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              weight: Number(s.weight || 0),
              gradeSlots: (s.grade_slots || []).map((g: any) => ({
                id: g.id,
                name: g.name,
                weight: Number(g.weight || 0),
                scale: g.scale || '1 - 5'
              }))
            }))
        })),
      subjects: (st.subjects || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        area: sub.area,
        lab: sub.lab,
        courses: Array.isArray(sub.courses) ? sub.courses : [],
        modalities: Array.isArray(sub.modalities) ? sub.modalities : [],
        levels: Array.isArray(sub.levels) ? sub.levels : [],
        skills: [] 
      }))
    }))
  };
}

export const api = {
  getSchoolYear: async (): Promise<SchoolYear> => {
    try {
      const { data: yearData, error: yearError } = await supabase
        .from('school_year_full')
        .select('*')
        .single();

      if (yearError || !yearData) throw yearError;

      const { data: skillsData } = await supabase
        .from('subject_skills')
        .select('*');

      const year = mapSchoolYear(yearData);

      if (skillsData && skillsData.length > 0) {
        year.stations.forEach(station => {
          station.subjects.forEach(subject => {
            subject.skills = skillsData
              .filter(s => s.subject_id === subject.id)
              .map(s => ({
                id: s.id,
                level: s.level,
                description: s.description
              }));
          });
        });
      }

      return year;
    } catch (e) {
      console.error("Critical error in getSchoolYear:", e);
      return MOCK_INITIAL_SCHOOL_YEAR;
    }
  },

  getStudents: async (): Promise<Student[]> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (error || !data) throw error;
      
      return (data as any[]).map(s => ({
        id: s.id,
        full_name: s.full_name,
        document: s.document,
        avatar: s.avatar_url,
        academic_level: s.academic_level,
        grade: s.grade,
        atelier: s.atelier,
        modality: s.modality
      }));
    } catch (e) {
      return MOCK_INITIAL_STUDENTS;
    }
  },

  updateSchoolYear: async (year: SchoolYear): Promise<void> => {
    await supabase.from('school_years').upsert({ id: year.id, name: year.name });
    const stationMap = new Map<string, any>();
    const subjectMap = new Map<string, any>();
    const skillMap = new Map<string, any>();
    const momentMap = new Map<string, any>();
    const sectionMap = new Map<string, any>();
    const slotMap = new Map<string, any>();

    year.stations.forEach((station, sIdx) => {
      stationMap.set(station.id, {
        id: station.id, 
        school_year_id: year.id, 
        name: station.name,
        weight: station.weight, 
        start_date: station.startDate, 
        end_date: station.endDate, 
        sort_order: sIdx
      });

      station.subjects.forEach(sub => {
        const existingSubject = subjectMap.get(sub.id);
        const subCourses = Array.isArray(sub.courses) ? sub.courses : [];
        if (existingSubject) {
          subjectMap.set(sub.id, {
            ...existingSubject,
            courses: Array.from(new Set([...existingSubject.courses, ...subCourses])),
            modalities: Array.from(new Set([...existingSubject.modalities, ...(sub.modalities || [])])),
            levels: Array.from(new Set([...existingSubject.levels, ...(sub.levels || [])]))
          });
        } else {
          subjectMap.set(sub.id, {
            id: sub.id, 
            station_id: station.id, 
            name: sub.name, 
            area: sub.area,
            lab: sub.lab, 
            courses: subCourses, 
            modalities: sub.modalities || [], 
            levels: sub.levels || []
          });
        }
        sub.skills?.forEach(skill => {
          skillMap.set(skill.id, {
            id: skill.id, 
            subject_id: sub.id, 
            level: skill.level, 
            description: skill.description
          });
        });
      });

      station.moments.forEach((moment, mIdx) => {
        momentMap.set(moment.id, { 
          id: moment.id, 
          station_id: station.id, 
          name: moment.name, 
          weight: moment.weight, 
          sort_order: mIdx 
        });
        moment.sections.forEach((section, secIdx) => {
          sectionMap.set(section.id, { 
            id: section.id, 
            moment_id: moment.id, 
            name: section.name, 
            weight: section.weight, 
            sort_order: secIdx 
          });
          section.gradeSlots.forEach(gs => {
            slotMap.set(gs.id, { 
              id: gs.id, 
              section_id: section.id, 
              name: gs.name, 
              weight: gs.weight, 
              scale: gs.scale 
            });
          });
        });
      });
    });

    const execUpsert = async (table: string, dataMap: Map<string, any>) => {
      if (dataMap.size === 0) return;
      const dataArray = Array.from(dataMap.values());
      const { error } = await supabase.from(table).upsert(dataArray);
      if (error) throw error;
    };

    try {
      await execUpsert('stations', stationMap);
      await execUpsert('subjects', subjectMap);
      await execUpsert('subject_skills', skillMap);
      await execUpsert('learning_moments', momentMap);
      await execUpsert('sections', sectionMap);
      await execUpsert('grade_slots', slotMap);
    } catch (err) {
      console.error('[API] Error sincronizando estructura:', err);
      throw err;
    }
  },

  getGrades: async (): Promise<GradeEntry[]> => {
    try {
      const { data } = await supabase.from('grades').select('*');
      return (data || []).map(g => ({
        studentId: g.student_id, slotId: g.slot_id, subjectId: g.subject_id, value: g.value
      }));
    } catch (e) { return []; }
  },

  saveGrades: async (grades: GradeEntry[]): Promise<void> => {
    const valid = grades.filter(g => g.value !== null && isValidUUID(g.studentId)).map(g => ({
      student_id: g.studentId, slot_id: g.slotId, subject_id: g.subjectId, value: g.value
    }));
    if (valid.length > 0) await supabase.from('grades').upsert(valid, { onConflict: 'student_id,slot_id,subject_id' });
  },

  getLevelingGrades: async (): Promise<LevelingGrade[]> => {
    try {
      const { data } = await supabase.from('leveling_grades').select('*');
      return (data || []).map(l => ({
        studentId: l.student_id, subjectId: l.subject_id, stationId: l.station_id, value: l.value
      }));
    } catch (e) { return []; }
  },

  saveLevelingGrades: async (leveling: LevelingGrade[]): Promise<void> => {
    const valid = leveling.filter(l => l.value !== null && isValidUUID(l.studentId)).map(l => ({
      student_id: l.studentId, subject_id: l.subjectId, station_id: l.stationId, value: l.value
    }));
    if (valid.length > 0) await supabase.from('leveling_grades').upsert(valid, { onConflict: 'student_id,subject_id,station_id' });
  },

  getSkillSelections: async (): Promise<SkillSelection[]> => {
    try {
      const { data } = await supabase.from('student_skill_selections').select('*');
      return (data || []).map((s: any) => ({
        studentId: s.student_id,
        skillId: s.skill_id,
        subjectId: s.subject_id,
        stationId: s.station_id
      }));
    } catch (e) { return []; }
  },

  saveSkillSelections: async (selections: SkillSelection[], subjectId: string, stationId: string): Promise<void> => {
    if (!isValidUUID(subjectId) || !isValidUUID(stationId)) return;
    try {
      await supabase.from('student_skill_selections').delete().match({ subject_id: subjectId, station_id: stationId });
      const valid = selections.filter(s => s.subjectId === subjectId && s.stationId === stationId).map(s => ({
        student_id: s.studentId, skill_id: s.skillId, subject_id: s.subjectId, station_id: s.stationId
      }));
      if (valid.length > 0) await supabase.from('student_skill_selections').insert(valid);
    } catch (err) {
      console.error('[API] Error guardando habilidades:', err);
      throw err;
    }
  }
};
