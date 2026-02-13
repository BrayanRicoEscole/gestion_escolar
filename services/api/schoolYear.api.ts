
import { supabase } from './client';
import { SchoolYear, Station, Subject, LearningMoment, Section, GradeSlot } from 'types';
import { MOCK_INITIAL_SCHOOL_YEAR } from '../mockInitialData';

/**
 * Obtiene la lista simplificada de años escolares disponibles
 */
export const getSchoolYearsList = async (): Promise<{id: string, name: string}[]> => {
  const { data, error } = await supabase
    .from('school_years')
    .select('id, name')
    .order('name', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Obtiene la estructura completa de un año escolar específico
 */
export const getSchoolYear = async (yearId?: string): Promise<SchoolYear> => {
  try {
    let query = supabase.from('school_year_full').select('*');
    
    if (yearId) {
      query = query.eq('id', yearId);
    } else {
      // Si no hay ID, tomamos el más reciente por nombre
      query = query.order('name', { ascending: false }).limit(1);
    }

    const { data: yearData, error } = await query.maybeSingle();

    if (error) throw error;
    if (!yearData) throw new Error("No se encontró el año escolar.");

    const { data: skillsData } =
      await supabase.from('subject_skills').select('*');

    return {
      id: yearData.id,
      name: yearData.name,
      stations: (yearData.stations || [])
        .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .map((st: any) => ({
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
          subjects: (st.subjects || [])
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((sub: any) => ({
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
  } catch (e) {
    console.warn("[API] Error cargando estructura, ID:", yearId, e);
    return MOCK_INITIAL_SCHOOL_YEAR;
  }
};

/**
 * Función auxiliar para eliminar duplicados por ID en un array de objetos
 */
const deDuplicateById = <T extends { id: string }>(arr: T[]): T[] => {
  const map = new Map<string, T>();
  arr.forEach(item => map.set(item.id, item));
  return Array.from(map.values());
};

export const updateSchoolYear = async (year: SchoolYear): Promise<void> => {
  console.log("[API] Iniciando guardado recursivo de la estructura escolar...");

  // 1. Upsert del Año Escolar
  const { error: yearError } = await supabase
    .from('school_years')
    .upsert({ id: year.id, name: year.name });

  if (yearError) throw yearError;

  // 2. Preparar y Upsert de Estaciones
  const stationsToUpsert = deDuplicateById(year.stations.map(st => ({
    id: st.id,
    school_year_id: year.id,
    name: st.name,
    weight: st.weight,
    start_date: st.startDate,
    end_date: st.endDate
  })));

  const { error: stationsError } = await supabase
    .from('stations')
    .upsert(stationsToUpsert);

  if (stationsError) throw stationsError;

  // 3. Preparar arrays colectores
  const rawSubjects: any[] = [];
  const rawStationSubjects: any[] = []; 
  const rawMoments: any[] = [];
  const rawSections: any[] = [];
  const rawSlots: any[] = [];

  year.stations.forEach(st => {
    (st.subjects || []).forEach(sub => {
      rawSubjects.push({
        id: sub.id,
        name: sub.name,
        area: sub.area,
        lab: sub.lab,
        courses: sub.courses ?? [],
        modalities: sub.modalities ?? [],
        levels: sub.levels ?? []
      });

      rawStationSubjects.push({
        station_id: st.id,
        subject_id: sub.id
      });
    });

    (st.moments || []).forEach((m, idx) => {
      rawMoments.push({
        id: m.id,
        station_id: st.id,
        name: m.name,
        weight: m.weight,
        sort_order: idx
      });

      (m.sections || []).forEach((sec, sIdx) => {
        rawSections.push({
          id: sec.id,
          moment_id: m.id,
          name: sec.name,
          weight: sec.weight,
          sort_order: sIdx
        });

        (sec.gradeSlots || []).forEach(slot => {
          rawSlots.push({
            id: slot.id,
            section_id: sec.id,
            name: slot.name,
            weight: slot.weight,
            scale: slot.scale || '1 - 5'
          });
        });
      });
    });
  });

  if (rawSubjects.length > 0) {
    const finalSubjects = deDuplicateById(rawSubjects);
    const { error: subError } = await supabase.from('subjects').upsert(finalSubjects);
    if (subError) throw subError;

    const uniqueStationSubjects = Array.from(
      new Map(rawStationSubjects.map(item => [`${item.station_id}-${item.subject_id}`, item])).values()
    );

    const { error: relError } = await supabase
      .from('station_subjects')
      .upsert(uniqueStationSubjects);
    
    if (relError) throw relError;
  }

  if (rawMoments.length > 0) {
    const finalMoments = deDuplicateById(rawMoments);
    const { error: momError } = await supabase.from('learning_moments').upsert(finalMoments);
    if (momError) throw momError;
  }

  if (rawSections.length > 0) {
    const finalSections = deDuplicateById(rawSections);
    const { error: secError } = await supabase.from('sections').upsert(finalSections);
    if (secError) throw secError;
  }

  if (rawSlots.length > 0) {
    const finalSlots = deDuplicateById(rawSlots);
    const { error: slotError } = await supabase.from('grade_slots').upsert(finalSlots);
    if (slotError) throw slotError;
  }
};
