
import { supabase } from './client';
import { SchoolYear, Station, Subject, LearningMoment, Section, GradeSlot } from 'types';
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
  const rawStationSubjects: any[] = []; // Colector para la tabla intermedia
  const rawMoments: any[] = [];
  const rawSections: any[] = [];
  const rawSlots: any[] = [];

  year.stations.forEach(st => {
    // Colectar Asignaturas y sus asociaciones
    (st.subjects || []).forEach(sub => {
      rawSubjects.push({
        id: sub.id,
        station_id: st.id, // Referencia directa en subjects
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

    // Colectar Momentos
    (st.moments || []).forEach((m, idx) => {
      rawMoments.push({
        id: m.id,
        station_id: st.id,
        name: m.name,
        weight: m.weight,
        sort_order: idx
      });

      // Colectar Secciones
      (m.sections || []).forEach((sec, sIdx) => {
        rawSections.push({
          id: sec.id,
          moment_id: m.id,
          name: sec.name,
          weight: sec.weight,
          sort_order: sIdx
        });

        // Colectar Notas
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

  // 4. Upserts con Desduplicación
  
  if (rawSubjects.length > 0) {
    const finalSubjects = deDuplicateById(rawSubjects);
    const { error: subError } = await supabase.from('subjects').upsert(finalSubjects);
    if (subError) throw subError;

    // IMPORTANTE: Sincronizar tabla intermedia station_subjects
    // Filtramos duplicados de la relación compuesta
    const uniqueStationSubjects = Array.from(
      new Map(rawStationSubjects.map(item => [`${item.station_id}-${item.subject_id}`, item])).values()
    );

    const { error: relError } = await supabase
      .from('station_subjects')
      .upsert(uniqueStationSubjects);
    
    if (relError) {
      console.error("[API] Error al sincronizar station_subjects:", relError);
      throw relError;
    }
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

  console.log("[API] Estructura sincronizada correctamente. Total procesado:", {
    asignaturas: rawSubjects.length,
    relaciones_estacion: rawStationSubjects.length,
    momentos: rawMoments.length,
    secciones: rawSections.length,
    notas: rawSlots.length
  });
};
