import { createClient } from '@supabase/supabase-js';
import { SchoolYear, Student, GradeEntry, Area, Lab, LearningMoment, Subject } from '../types';
import { MOCK_INITIAL_SCHOOL_YEAR, MOCK_INITIAL_STUDENTS } from './mockInitialData';

const SUPABASE_URL = 'https://gzdiljudmdezdkntnhml.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGlsanVkbWRlemRrbnRuaG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzQ5OTEsImV4cCI6MjA4NTExMDk5MX0.Ui20tkVIXRslewslnM7vzDKkftdpxLnFBZn3KzoOue0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'api'
  }
});

// --- LOGGER MIDDLEWARE ---
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

// Helper to validate UUID format
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
                // subjectId removed as slots are now global
              }))
            }))
        })),
      subjects: st.subjects || []
    }))
  };
}

const diffIds = (existing: any[], incoming: any[]) =>
  existing
    .filter(e => !incoming.find(i => i.id === e.id))
    .map(e => e.id);

export const api = {
  getSchoolYear: async (): Promise<SchoolYear> => {
    apiLogger.logQuery('SELECT', 'school_year_full');
    try {
      const { data, error, status } = await supabase
        .from('school_year_full')
        .select('*')
        .single();

      apiLogger.logResponse(status, data, error);
      if (error || !data) throw error;
      return mapSchoolYear(data);
    } catch (e) {
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
      if (error || !data || data.length === 0) throw error;
      return data as Student[];
    } catch (e) {
      return MOCK_INITIAL_STUDENTS;
    }
  },

  updateSchoolYear: async (year: SchoolYear): Promise<void> => {
    apiLogger.logQuery('UPSERT TRANSACTION', 'school_year_structure', year);
    
    // Step 1: Year
    const { status: yStatus, error: yError } = await supabase
      .from('school_years')
      .upsert({ id: year.id, name: year.name }, { onConflict: 'id' });
    apiLogger.logResponse(yStatus, 'Year upserted', yError);

    // Step 2: Stations
    const { data: existingStations } = await supabase
      .from('stations')
      .select('id')
      .eq('school_year_id', year.id);

    const stationRows = year.stations.map((s, idx) => ({
      id: s.id,
      school_year_id: year.id,
      name: s.name,
      weight: s.weight,
      start_date: s.startDate,
      end_date: s.endDate,
      sort_order: idx
    }));

    const { status: stStatus, error: stError } = await supabase.from('stations').upsert(stationRows);
    apiLogger.logResponse(stStatus, 'Stations upserted', stError);

    if (existingStations) {
      const toDelete = diffIds(existingStations, year.stations);
      if (toDelete.length) {
        apiLogger.logQuery('DELETE', 'stations', toDelete);
        await supabase.from('stations').delete().in('id', toDelete);
      }
    }

    // Step 3: Deep nested update
    for (const station of year.stations) {
      // Subjects
      const { status: subStatus, error: subError } = await supabase.from('subjects').upsert(
        station.subjects.map(sub => ({
          id: sub.id,
          station_id: station.id,
          name: sub.name,
          area: sub.area,
          lab: sub.lab,
          courses: sub.courses,
          modalities: sub.modalities,
          levels: sub.levels
        }))
      );
      apiLogger.logResponse(subStatus, `Subjects for station ${station.name} upserted`, subError);

      // Moments
      const { status: mStatus, error: mError } = await supabase.from('learning_moments').upsert(
        station.moments.map((m, idx) => ({
          id: m.id,
          station_id: station.id,
          name: m.name,
          weight: m.weight,
          sort_order: idx
        }))
      );
      apiLogger.logResponse(mStatus, `Moments for station ${station.name} upserted`, mError);

      for (const moment of station.moments) {
        // Sections
        const { status: secStatus, error: secError } = await supabase.from('sections').upsert(
          moment.sections.map((s, idx) => ({
            id: s.id,
            moment_id: moment.id,
            name: s.name,
            weight: s.weight,
            sort_order: idx
          }))
        );
        apiLogger.logResponse(secStatus, `Sections for moment ${moment.name} upserted`, secError);

        for (const section of moment.sections) {
          // Grade Slots - REMOVED subject_id as it's no longer in the schema for this table
          const { status: gsStatus, error: gsError } = await supabase.from('grade_slots').upsert(
            section.gradeSlots.map(gs => ({
              id: gs.id,
              section_id: section.id,
              name: gs.name,
              weight: gs.weight,
              scale: gs.scale
            }))
          );
          apiLogger.logResponse(gsStatus, `Grade slots for section ${section.name} upserted`, gsError);
        }
      }
    }
  },

  getGrades: async (): Promise<GradeEntry[]> => {
    apiLogger.logQuery('SELECT', 'grades');
    try {
      const { data, error, status } = await supabase
        .from('grades')
        .select('*');

      apiLogger.logResponse(status, data ? `${data.length} grades fetched` : null, error);
      if (error || !data) return [];
      
      return data.map(g => ({
        studentId: g.student_id,
        slotId: g.slot_id,
        subjectId: g.subject_id || '00000000-0000-0000-0000-000000000000',
        value: g.value
      }));
    } catch (e) {
      return [];
    }
  },

  saveGrades: async (grades: GradeEntry[]): Promise<void> => {
    const validEntries = grades
      .filter(g => g.value !== null && isValidUUID(g.studentId) && isValidUUID(g.slotId))
      .map(g => ({
        student_id: g.studentId,
        slot_id: g.slotId,
        subject_id: g.subjectId,
        value: g.value
      }));

    if (validEntries.length === 0) return;

    apiLogger.logQuery('UPSERT', 'grades', validEntries);
    const { error, status } = await supabase
      .from('grades')
      .upsert(validEntries, { onConflict: 'student_id,slot_id,subject_id' });

    apiLogger.logResponse(status, 'Grades synchronized', error);
    if (error) throw error;
  }
};