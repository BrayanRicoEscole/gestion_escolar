
import { supabase } from './client';
import { Student, AcademicRecord } from 'types';

/**
 * Limpia el nivel académico: toma la primera letra y los números siguientes,
 * asegurando que siempre tenga un número (ej: C -> C1, M1-RC -> M1)
 */
const cleanAcademicLevel = (level: string | undefined): string => {
  if (!level || level.trim() === '' || level === 'N/A') return 'N/A';
  // Mantener letra y números iniciales, descartar sufijos de modalidad
  const match = level.trim().toUpperCase().match(/^[A-Z][0-9]*/);
  let cleaned = match ? match[0] : 'N/A';
  
  // Si es solo una letra, añadir '1' por defecto
  if (cleaned.length === 1 && cleaned !== 'N/A') {
    return cleaned + '1';
  }
  return cleaned;
};

/**
 * Obtiene la lista de estudiantes que NO están activos
 */
export const getRetiredStudents = async (): Promise<Student[]> => {
  console.log("[API:Retired] 📥 Obteniendo archivo de retirados...");
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .not('estado_actual', 'ilike', '%activo%')
    .order('full_name');

  if (error) throw error;
  return data || [];
};

/**
 * Obtiene el historial de años cursados por un alumno
 */
export const getStudentAcademicHistory = async (studentId: string): Promise<AcademicRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('student_academic_records')
      .select(`*, school_years (name)`)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(r => ({
      id: r.id,
      student_id: r.student_id,
      school_year_id: r.school_year_id,
      school_year_name: r.school_years?.name || 'N/A',
      grade: r.grade,
      academic_level: r.academic_level,
      atelier: r.atelier,
      modality: r.modality,
      status: r.status,
      observations: r.observations,
      start_date: r.start_date,
      end_date: r.end_date,
      created_at: r.created_at
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Proceso oficial de retiro: Cambia estado base y crea registro histórico
 */
export const retireStudent = async (params: {
  studentId: string,
  schoolYearId: string,
  status: string, 
  observations: string,
  currentGrade: string,
  currentLevel: string,
  currentAtelier: string,
  currentModality: string
}) => {
  console.log(`[API:Retired] Procesando retiro para ID: ${params.studentId}`);
  
  // 1. Actualizar tabla base
  const { error: updateError } = await supabase
    .from('students')
    .update({ estado_actual: params.status })
    .eq('id', params.studentId);

  if (updateError) throw updateError;

  // 2. Crear registro en historial
  const { error: recordError } = await supabase
    .from('student_academic_records')
    .upsert({
      student_id: params.studentId,
      school_year_id: params.schoolYearId,
      grade: params.currentGrade,
      academic_level: cleanAcademicLevel(params.currentLevel),
      atelier: params.currentAtelier,
      modality: params.currentModality,
      status: params.status,
      observations: params.observations
    }, { onConflict: 'student_id,school_year_id' });

  if (recordError) throw recordError;
  return true;
};

/**
 * Obtiene las notas de un estudiante para un año específico, 
 * incluyendo la estructura de estaciones y materias.
 */
export const getStudentGradesByYear = async (studentId: string, schoolYearId: string) => {
  console.log(`[API:History] Obteniendo notas para Estudiante: ${studentId}, Año: ${schoolYearId}`);
  
  // 1. Obtener Estaciones y Materias del año
  const { data: stations, error: sError } = await supabase
    .from('stations')
    .select(`
      id, name, weight,
      subjects (id, name, area)
    `)
    .eq('school_year_id', schoolYearId)
    .order('name');

  if (sError) throw sError;

  // 2. Obtener Notas del estudiante
  const { data: grades, error: gError } = await supabase
    .from('grades')
    .select('subject_id, value, slot_id')
    .eq('student_id', studentId);

  if (gError) throw gError;

  // 3. Obtener Notas de Nivelación
  const { data: leveling, error: lError } = await supabase
    .from('leveling_grades')
    .select('subject_id, station_id, value')
    .eq('student_id', studentId);

  if (lError) throw lError;

  // 4. Obtener Estructura de Slots para calcular promedios si es necesario
  // Para simplificar esta vista histórica, mostraremos el promedio por materia/estación
  // si el sistema ya tiene una función de cálculo, la usaríamos. 
  // Pero aquí haremos un resumen por materia en cada estación.
  
  return {
    stations: stations || [],
    grades: grades || [],
    leveling: leveling || []
  };
};

/**
 * Actualiza un registro académico histórico
 */
export const updateAcademicRecord = async (recordId: string, data: Partial<AcademicRecord>) => {
  const { error } = await supabase
    .from('student_academic_records')
    .update({
      grade: data.grade,
      academic_level: cleanAcademicLevel(data.academic_level),
      atelier: data.atelier,
      modality: data.modality,
      status: data.status,
      observations: data.observations,
      created_at: data.created_at,
      start_date: data.start_date,
      end_date: data.end_date
    })
    .eq('id', recordId);

  if (error) throw error;
  return true;
};

/**
 * Obtiene todos los registros académicos con filtros opcionales
 */
export const getAllAcademicRecords = async (filters?: {
  schoolYearId?: string;
  academicLevel?: string;
  atelier?: string;
  status?: string;
}): Promise<AcademicRecord[]> => {
  let query = supabase
    .from('student_academic_records')
    .select(`*, school_years (name), students (full_name, document)`)
    .order('created_at', { ascending: false });

  if (filters?.schoolYearId) query = query.eq('school_year_id', filters.schoolYearId);
  if (filters?.academicLevel) query = query.eq('academic_level', filters.academicLevel);
  if (filters?.atelier) query = query.eq('atelier', filters.atelier);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    student_id: r.student_id,
    student_name: r.students?.full_name || 'N/A',
    student_document: r.students?.document || 'N/A',
    school_year_id: r.school_year_id,
    school_year_name: r.school_years?.name || 'N/A',
    grade: r.grade,
    academic_level: r.academic_level,
    atelier: r.atelier,
    modality: r.modality,
    status: r.status,
    observations: r.observations,
    start_date: r.start_date,
    end_date: r.end_date,
    created_at: r.created_at
  }));
};

/**
 * Importación masiva de registros académicos desde CSV
 */
export const syncAcademicRecordsFromCSV = async (records: any[]) => {
  const toUpsert = records.map(r => ({
    student_id: r.student_id,
    school_year_id: r.school_year_id,
    grade: r.grade,
    academic_level: cleanAcademicLevel(r.academic_level),
    atelier: r.atelier,
    modality: r.modality,
    status: r.status,
    observations: r.observations,
    start_date: r.start_date,
    end_date: r.end_date
  }));

  const { error } = await supabase
    .from('student_academic_records')
    .upsert(toUpsert, { onConflict: 'student_id,school_year_id' });

  if (error) throw error;
  return true;
};
