
import { supabase } from './client';
import { SchoolYear, Station, Subject, LearningMoment, Section, GradeSlot, Student } from 'types';
import { MOCK_INITIAL_SCHOOL_YEAR } from '../mockInitialData';

/**
 * Obtiene la lista simplificada de años escolares disponibles
 */
export const getSchoolYearsList = async (): Promise<{id: string, name: string}[]> => {
  const { data, error } = await supabase
    .schema('api')
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
    let query = supabase.schema('api').from('school_year_full').select('*');
    
    if (yearId) {
      query = query.eq('id', yearId);
    } else {
      // Si no hay ID, tomamos el más reciente por nombre
      query = query.order('name', { ascending: false }).limit(1);
    }

    const { data: yearData, error } = await query.maybeSingle();

    if (error) throw error;
    if (!yearData) throw new Error("No se encontró el año escolar.");

    // Fetch directo de secciones para asegurar que obtenemos el grading_type
    // incluso si la vista school_year_full no ha sido actualizada
    const { data: sectionsDb } = await supabase
      .schema('api')
      .from('sections')
      .select('id, grading_type');

    const gradingTypeMap = new Map(sectionsDb?.map(s => [s.id, s.grading_type]) || []);

    const { data: skillsData } =
      await supabase.schema('api').from('subject_skills').select('*');

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
                  grading_type: gradingTypeMap.get(s.id) || s.grading_type || 'weighted',
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
              station_id: sub.station_id,
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

/**
 * Helper para determinar si una materia es relevante para un estudiante
 */
export const isSubjectRelevant = (student: Student, subject: Subject): boolean => {
  const atelierName = (student.atelier || '').toLowerCase();
  let suffix = 'C';
  if (atelierName.includes('alhambra')) suffix = 'A';
  else if (atelierName.includes('mandalay')) suffix = 'MS';
  else if (atelierName.includes('mónaco') || atelierName.includes('monaco')) suffix = 'M';
  else if (atelierName.includes('casa')) suffix = 'C';

  // Limpiar el nivel académico para evitar duplicación de sufijos (ej: H1-MS -> H1)
  const rawLevel = (student.academic_level || '').trim().toUpperCase();
  const match = rawLevel.match(/^[A-Z][0-9]*/);
  let cleanedLevel = match ? match[0] : 'N/A';
  
  // Asegurar que tenga número si es solo una letra
  if (cleanedLevel.length === 1 && cleanedLevel !== 'N/A') {
    cleanedLevel += '1';
  }

  const studentCourseCode = `${cleanedLevel}-${suffix}`;
  const levelChar = cleanedLevel.charAt(0).toUpperCase();

  const isRelevant = !levelChar || levelChar === 'N' || (
    (subject.courses.length === 0 && subject.levels.length === 0) || 
    subject.courses.some(c => {
      const cleanC = c.trim().toUpperCase();
      return cleanC === studentCourseCode || cleanC === rawLevel;
    }) ||
    subject.levels.some(l => l.toUpperCase() === levelChar)
  );

  if (student.full_name.toLowerCase().includes('shalome')) {

  }

  return isRelevant;
};

export const updateSchoolYear = async (year: SchoolYear): Promise<void> => {
 

  // 1. Upsert del Año Escolar
  const { error: yearError } = await supabase
    .schema('api')
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
    .schema('api')
    .from('stations')
    .upsert(stationsToUpsert);

  if (stationsError) throw stationsError;

  // 3. Preparar arrays colectores
  const rawSubjects: any[] = [];
  const rawStationSubjects: any[] = []; 
  const rawMoments: any[] = [];
  const rawSections: any[] = [];
  const rawSlots: any[] = [];
  const rawSkills: any[] = [];

  year.stations.forEach(st => {
    (st.subjects || []).forEach(sub => {
      rawSubjects.push({
        id: sub.id,
        name: sub.name,
        area: sub.area,
        lab: sub.lab,
        courses: sub.courses ?? [],
        modalities: sub.modalities ?? [],
        levels: sub.levels ?? [],
        station_id: st.id
      });

      rawStationSubjects.push({
        station_id: st.id,
        subject_id: sub.id
      });

      (sub.skills || []).forEach(skill => {
        const isTemp = !skill.id || skill.id.startsWith('temp-');
        const skillObj: any = {
          subject_id: sub.id,
          level: skill.level,
          description: skill.description
        };
        
        if (!isTemp) {
          skillObj.id = skill.id;
        }
        
        rawSkills.push(skillObj);
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
          grading_type: sec.grading_type || 'weighted',
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
    const { error: subError } = await supabase.schema('api').from('subjects').upsert(finalSubjects);
    if (subError) throw subError;

    const uniqueStationSubjects = Array.from(
      new Map(rawStationSubjects.map(item => [`${item.station_id}-${item.subject_id}`, item])).values()
    );

    const { error: relError } = await supabase
      .schema('api')
      .from('station_subjects')
      .upsert(uniqueStationSubjects);
    
    if (relError) throw relError;
  }

  if (rawMoments.length > 0) {
    const finalMoments = deDuplicateById(rawMoments);
    const { error: momError } = await supabase.schema('api').from('learning_moments').upsert(finalMoments);
    if (momError) throw momError;
  }

  if (rawSections.length > 0) {
    const finalSections = deDuplicateById(rawSections);
    const { error: secError } = await supabase.schema('api').from('sections').upsert(finalSections);
    if (secError) throw secError;
  }

  if (rawSlots.length > 0) {
    const finalSlots = deDuplicateById(rawSlots);
    const { error: slotError } = await supabase.schema('api').from('grade_slots').upsert(finalSlots);
    if (slotError) throw slotError;
  }

  if (rawSkills.length > 0) {
    
    
    // De-duplicar habilidades con ID (las que se van a actualizar)
    const toUpdate = deDuplicateById(rawSkills.filter(s => s.id));
    // Las que no tienen ID se insertan directamente
    const toInsert = rawSkills.filter(s => !s.id);

    if (toUpdate.length > 0) {
      const { error: updateError } = await supabase.schema('api').from('subject_skills').upsert(toUpdate);
      if (updateError) throw updateError;
    }

    if (toInsert.length > 0) {
   
      const { error: insertError } = await supabase.schema('api').from('subject_skills').insert(toInsert);
      if (insertError) throw insertError;
    }
  }
};
