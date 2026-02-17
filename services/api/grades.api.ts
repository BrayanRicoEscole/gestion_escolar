import { supabase } from './client';
import { GradeEntry, LevelingGrade, SkillSelection } from 'types';
import { isValidUUID } from './utils';

export const getGrades = async (): Promise<GradeEntry[]> => {
  const { data } = await supabase.from('grades').select('*');
  return (data || []).map(g => ({
    studentId: g.student_id,
    slotId: g.slot_id,
    subjectId: g.subject_id,
    value: g.value
  }));
};

export const saveGrades = async (grades: GradeEntry[]): Promise<void> => {
  const payload = grades
    .filter(g => isValidUUID(g.studentId))
    .map(g => ({
      student_id: g.studentId,
      // Fix: Property 'slot_id' does not exist on type 'GradeEntry'. Correcting to 'slotId'.
      slot_id: g.slotId,
      subject_id: g.subjectId,
      value: g.value
    }));

  if (!payload.length) return;

  const { error } = await supabase
    .from('grades')
    .upsert(payload, { onConflict: 'student_id,slot_id,subject_id' });

  if (error) throw error;
};

/**
 * IMPORTACIÓN PROFUNDA:
 * 1. Valida existencia global por documento.
 * 2. Matricula si el estudiante existe pero no está en el periodo.
 * 3. Identifica faltantes.
 * 4. Guarda notas y habilidades.
 */
export const processDeepGradesImport = async (
  csvRows: any[],
  schoolYearId: string,
  stationId: string,
  subjectId: string
): Promise<{ successCount: number; missingDocuments: string[]; enrolledCount: number }> => {
  console.group("[API:DeepImport] Iniciando procesamiento...");
  
  const documents = csvRows.map(r => r.document);
  
  // 1. Buscar estudiantes existentes en toda la DB
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, document, full_name, grade, academic_level, atelier, modality')
    .in('document', documents);

  // Fix: Explicitly type studentMap to Map<string, any> and cast Supabase items to any to resolve 'unknown' type errors.
  const studentMap = new Map<string, any>(allStudents?.map((s: any) => [s.document, s]) || []);
  const missingDocuments: string[] = [];
  const studentsToProcess: any[] = [];

  // Clasificar
  csvRows.forEach(row => {
    const student = studentMap.get(row.document);
    if (!student) {
      missingDocuments.push(`${row.document} (${row.fullName || 'N/A'})`);
    } else {
      // Fix: student is now typed as any, allowing access to .id property
      studentsToProcess.push({ ...row, dbId: student.id, dbInfo: student });
    }
  });

  if (studentsToProcess.length === 0) {
    console.groupEnd();
    return { successCount: 0, missingDocuments, enrolledCount: 0 };
  }

  // 2. Verificar quiénes de los encontrados ya están matriculados
  const { data: enrolledRecords } = await supabase
    .from('student_academic_records')
    .select('student_id')
    .eq('school_year_id', schoolYearId)
    .in('student_id', studentsToProcess.map(s => s.dbId));

  const enrolledIds = new Set(enrolledRecords?.map(r => r.student_id) || []);
  const toEnroll = studentsToProcess.filter(s => !enrolledIds.has(s.dbId));

  // 3. Matricular automáticamente a los que faltan
  if (toEnroll.length > 0) {
    console.log(`-> Matriculando automáticamente a ${toEnroll.length} estudiantes encontrados...`);
    const enrollmentPayload = toEnroll.map(s => ({
      student_id: s.dbId,
      school_year_id: schoolYearId,
      grade: s.dbInfo.grade || 'N/A',
      academic_level: s.dbInfo.academic_level || 'N/A',
      atelier: s.dbInfo.atelier || 'N/A',
      modality: s.dbInfo.modality || 'N/A',
      status: 'Matriculado (Auto-Import)'
    }));

    const { error: enrollError } = await supabase
      .from('student_academic_records')
      .upsert(enrollmentPayload, { onConflict: 'student_id,school_year_id' });
    
    if (enrollError) console.error("Error en auto-matrícula:", enrollError);
  }

  // 4. Preparar carga masiva de notas
  const gradesPayload: any[] = [];
  const skillsPayload: any[] = [];

  studentsToProcess.forEach(s => {
    s.grades.forEach((g: any) => {
      gradesPayload.push({
        student_id: s.dbId,
        slot_id: g.slotId,
        subject_id: subjectId,
        value: g.value
      });
    });

    s.skillIds.forEach((skId: string) => {
      skillsPayload.push({
        student_id: s.dbId,
        skill_id: skId,
        subject_id: subjectId,
        station_id: stationId
      });
    });
  });

  // 5. Ejecutar UPSERTS
  if (gradesPayload.length > 0) {
    await supabase.from('grades').upsert(gradesPayload, { onConflict: 'student_id,slot_id,subject_id' });
  }

  if (skillsPayload.length > 0) {
    // Limpiar previas para evitar duplicidad si el ID de habilidad cambió
    await supabase.from('student_skill_selections').delete().match({ 
      subject_id: subjectId, 
      station_id: stationId 
    }).in('student_id', studentsToProcess.map(s => s.dbId));
    
    await supabase.from('student_skill_selections').insert(skillsPayload);
  }

  console.groupEnd();
  return { 
    successCount: studentsToProcess.length, 
    missingDocuments, 
    enrolledCount: toEnroll.length 
  };
};

export const getLevelingGrades = async (): Promise<LevelingGrade[]> => {
  const { data } = await supabase.from('leveling_grades').select('*');
  return (data || []).map(l => ({
    studentId: l.student_id,
    subjectId: l.subject_id,
    stationId: l.station_id,
    value: l.value
  }));
};

export const saveLevelingGrades = async (grades: LevelingGrade[]) => {
  const payload = grades
    .filter(g => isValidUUID(g.studentId))
    .map(g => ({
      student_id: g.studentId,
      subject_id: g.subjectId,
      station_id: g.stationId,
      value: g.value
    }));

  if (!payload.length) return;

  const { error } = await supabase
    .from('leveling_grades')
    .upsert(payload, { onConflict: 'student_id,subject_id,station_id' });

  if (error) throw error;
};