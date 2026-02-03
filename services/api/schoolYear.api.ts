import { supabase } from './client';
import { SchoolYear } from 'types';
import { MOCK_INITIAL_SCHOOL_YEAR } from '../mockInitialData';

export const getSchoolYear = async (): Promise<SchoolYear> => {
  try {
    const { data: yearData, error } =
      await supabase.from('school_year_full').select('*').single();

    if (error || !yearData) throw error;

    const { data: skillsData } =
      await supabase.from('subject_skills').select('*');

    return {
      id: yearData.id,
      name: yearData.name,
      stations: (yearData.stations || []).map((st: any) => ({
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
          courses: sub.courses ?? [],
          modalities: sub.modalities ?? [],
          levels: sub.levels ?? [],
          skills:
            skillsData
              ?.filter(s => s.subject_id === sub.id)
              .map(s => ({
                id: s.id,
                level: s.level,
                description: s.description
              })) ?? []
        }))
      }))
    };
  } catch {
    return MOCK_INITIAL_SCHOOL_YEAR;
  }
};

export const updateSchoolYear = async (year: SchoolYear): Promise<void> => {
  const { error } = await supabase
    .from('school_years')
    .upsert({ id: year.id, name: year.name });

  if (error) throw error;
};
