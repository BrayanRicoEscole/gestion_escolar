import { createClient } from '@supabase/supabase-js';
import { SchoolYear, Student, GradeEntry, SkillSelection, Subject, Skill } from '../types';
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
    if (params) console.log('Params:', params);
    console.groupEnd();
  },
  logResponse: (status: number, data: any, error: any) => {
    const isError = error || status >= 400;
    const color = isError ? '#e11d48' : '#10b981';
    console.groupCollapsed(
      `%c[DB RESPONSE] %cStatus: %c${status}`,
      `color: ${color}; font-weight: bold;`,
      'color: #64748b; font-weight: normal;',
      `color: ${color}; font-weight: bold;`
    );
    if (data) console.log('Data:', data);
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
      weight: Number(st.weight),
      startDate: st.start_date,
      endDate: st.end_date,
      moments: (st.learning_moments || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((m: any) => ({
          id: m.id,
          name: m.name,
          weight: Number(m.weight),
          sections: (m.sections || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              weight: Number(s.weight),
              gradeSlots: (s.grade_slots || []).map((g: any) => ({
                id: g.id,
                name: g.name,
                weight: Number(g.weight),
                scale: g.scale
              }))
            }))
        })),
      subjects: (st.subjects || []).map((sub: any) => ({
        ...sub,
        skills: [] // Inicialmente vacío, se llena con consulta separada
      }))
    }))
  };
}

export const api = {
  getSchoolYear: async (): Promise<SchoolYear> => {
    apiLogger.logQuery('SELECT', 'school_year_full + subject_skills');
    try {
      // Consulta 1: Estructura del año
      const { data: yearData, error: yearError, status: yearStatus } = await supabase
        .from('school_year_full')
        .select('*')
        .single();

      if (yearError || !yearData) throw yearError;

      // Consulta 2: Todas las habilidades (separada para asegurar persistencia)
      const { data: skillsData, error: skillsError } = await supabase
        .from('subject_skills')
        .select('*');

      if (skillsError) console.error("Error fetching skills:", skillsError);

      const year = mapSchoolYear(yearData);

      // Inyectar habilidades en la estructura jerárquica
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

      apiLogger.logResponse(yearStatus, year, null);
      return year;
    } catch (e) {
      console.error("Critical error in getSchoolYear:", e);
      return MOCK_INITIAL_SCHOOL_YEAR;
    }
  },

  getStudents: async (): Promise<Student[]> => {
    apiLogger.logQuery('SELECT', 'students', { order: 'full_name' });
    try {
      const { data, error, status } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      apiLogger.logResponse(status, data ? `Fetched ${data.length} students` : null, error);
      if (error || !data) throw error;
      return data as Student[];
    } catch (e) {
      return MOCK_INITIAL_STUDENTS;
    }
  },

  updateSchoolYear: async (year: SchoolYear): Promise<void> => {
    apiLogger.logQuery('BATCH UPSERT (WITH SKILLS)', 'school_year_structure', year);
    
    await supabase.from('school_years').upsert({ id: year.id, name: year.name });

    const stationRows = new Map();
    const subjectRows = new Map();
    const skillRows = new Map();
    const momentRows = new Map();
    const sectionRows = new Map();
    const slotRows = new Map();

    year.stations.forEach((station, sIdx) => {
      stationRows.set(station.id, {
        id: station.id, school_year_id: year.id, name: station.name,
        weight: station.weight, start_date: station.startDate, end_date: station.endDate, sort_order: sIdx
      });

      station.subjects.forEach(sub => {
        subjectRows.set(sub.id, {
          id: sub.id, station_id: station.id, name: sub.name, area: sub.area,
          lab: sub.lab, courses: sub.courses, modalities: sub.modalities, levels: sub.levels
        });

        sub.skills?.forEach(skill => {
          skillRows.set(skill.id, {
            id: skill.id, subject_id: sub.id, level: skill.level, description: skill.description
          });
        });
      });

      station.moments.forEach((moment, mIdx) => {
        momentRows.set(moment.id, { id: moment.id, station_id: station.id, name: moment.name, weight: moment.weight, sort_order: mIdx });
        moment.sections.forEach((section, secIdx) => {
          sectionRows.set(section.id, { id: section.id, moment_id: moment.id, name: section.name, weight: section.weight, sort_order: secIdx });
          section.gradeSlots.forEach(gs => {
            slotRows.set(gs.id, { id: gs.id, section_id: section.id, name: gs.name, weight: gs.weight, scale: gs.scale });
          });
        });
      });
    });

    const execUpsert = async (table: string, dataMap: Map<string, any>) => {
      if (dataMap.size === 0) return;
      const { error } = await supabase.from(table).upsert(Array.from(dataMap.values()));
      if (error) {
        console.error(`Error upserting ${table}:`, error);
        throw error;
      }
    };

    await execUpsert('stations', stationRows);
    await execUpsert('subjects', subjectRows);
    await execUpsert('subject_skills', skillRows);
    await execUpsert('learning_moments', momentRows);
    await execUpsert('sections', sectionRows);
    await execUpsert('grade_slots', slotRows);
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

  getSkillSelections: async (): Promise<SkillSelection[]> => {
    apiLogger.logQuery('SELECT', 'student_skill_selections');
    const { data } = await supabase.from('student_skill_selections').select('*');
    return (data || []).map(s => ({
      studentId: s.student_id,
      skillId: s.skill_id,
      subjectId: s.subject_id,
      stationId: s.station_id
    }));
  },

  saveSkillSelections: async (selections: SkillSelection[]): Promise<void> => {
    const valid = selections.map(s => ({
      student_id: s.studentId,
      skill_id: s.skillId,
      subject_id: s.subjectId,
      station_id: s.stationId
    }));
    if (valid.length > 0) {
      await supabase.from('student_skill_selections').upsert(valid, { onConflict: 'student_id,skill_id,subject_id,station_id' });
    }
  }
};