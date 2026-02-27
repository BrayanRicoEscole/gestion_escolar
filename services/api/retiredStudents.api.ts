
import { supabase } from './client';
import { Student, AcademicRecord } from 'types';

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
      academic_level: params.currentLevel,
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
      academic_level: data.academic_level,
      atelier: data.atelier,
      modality: data.modality,
      status: data.status,
      observations: data.observations,
      created_at: data.created_at
    })
    .eq('id', recordId);

  if (error) throw error;
  return true;
};
