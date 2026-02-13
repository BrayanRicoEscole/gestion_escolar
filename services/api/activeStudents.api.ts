
import { supabase } from './client';
import { Student } from 'types';
import { chunkArray, isValidUUID } from './utils';

/**
 * Obtiene la lista de estudiantes marcados como Activos
 */
export const getActiveStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .ilike('estado_actual', '%activo%')
    .order('full_name');

  if (error) throw error;
  return data || [];
};

/**
 * Obtiene estudiantes vinculados a un año escolar específico (Matriculados)
 */
export const getEnrolledStudents = async (schoolYearId: string): Promise<Student[]> => {
  if (!isValidUUID(schoolYearId)) return [];

  const { data, error } = await supabase
    .from('student_academic_records')
    .select(`
      grade,
      academic_level,
      atelier,
      modality,
      status,
      students:student_id (*)
    `)
    .eq('school_year_id', schoolYearId);

  if (error) return [];

  return (data || [])
    .filter((item: any) => item.students !== null)
    .map((item: any) => ({
      ...item.students,
      grade: item.grade || item.students.grade,
      academic_level: item.academic_level || item.students.academic_level,
      atelier: item.atelier || item.students.atelier,
      modality: item.modality || item.students.modality
    }));
};

/**
 * Proceso de MATRÍCULA GLOBAL: Valida duplicados por documento antes de procesar
 */
export const enrollStudentsInYear = async (studentData: Student[], schoolYearId: string) => {
  console.group("[API:Matrícula]");
  try {
    // 1. Identificar estudiantes que ya existen en la base de datos por documento
    const documents = studentData.map(s => s.document);
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id, document')
      .in('document', documents);

    const existingDocsMap = new Map(existingStudents?.map(s => [s.document, s.id]) || []);
    
    // 2. Separar nuevos de existentes para evitar "crear de nuevo"
    const newStudentsPayload = studentData
      .filter(s => !existingDocsMap.has(s.document))
      .map(s => ({
        id: crypto.randomUUID(),
        document: s.document,
        full_name: s.full_name,
        academic_level: s.academic_level,
        grade: s.grade,
        atelier: s.atelier,
        modality: s.modality,
        estado_actual: s.estado_actual || 'Activo',
        rama: s.rama,
        calendario: s.calendario
      }));

    let allStudentsToLink: { id: string, document: string, grade?: string, academic_level?: string, atelier?: string, modality?: string }[] = [];

    // 3. Solo insertar los que verdaderamente son nuevos
    if (newStudentsPayload.length > 0) {
      const { data: created, error: createError } = await supabase
        .from('students')
        .insert(newStudentsPayload)
        .select('id, document, grade, academic_level, atelier, modality');
      
      if (createError) throw createError;
      if (created) allStudentsToLink = [...created];
    }

    // 4. Agregar la info de los que ya existían (sin re-crearlos)
    if (existingStudents && existingStudents.length > 0) {
      // Necesitamos la info académica actual de los existentes para el record
      const { data: existingFullInfo } = await supabase
        .from('students')
        .select('id, document, grade, academic_level, atelier, modality')
        .in('id', existingStudents.map(es => es.id));
      
      if (existingFullInfo) {
        allStudentsToLink = [...allStudentsToLink, ...existingFullInfo];
      }
    }

    // 5. Vincular todos al año lectivo (crear o actualizar record académico)
    const recordsToInsert = allStudentsToLink.map(s => ({
      student_id: s.id,
      school_year_id: schoolYearId,
      grade: s.grade || 'N/A',
      academic_level: s.academic_level || 'N/A',
      atelier: s.atelier || 'N/A',
      modality: s.modality || 'N/A',
      status: 'Matriculado'
    }));

    const { error: upsertError } = await supabase
      .from('student_academic_records')
      .upsert(recordsToInsert, { onConflict: 'student_id,school_year_id' });

    if (upsertError) throw upsertError;
    return true;
  } catch (e) {
    console.error("Fallo en matrícula:", e);
    throw e;
  } finally {
    console.groupEnd();
  }
};

/**
 * PROMOCIÓN MASIVA CORREGIDA: Sigue secuencia C -> D -> E ... -> N
 */
export const promoteStudentsInBulk = async (students: Student[]) => {
  const levelSequence = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const gradeMapping: Record<string, string> = {
    'C': 'Pre-Escolar', 'D': '1', 'E': '2', 'F': '3', 'G': '4', 
    'H': '5', 'I': '6', 'J': '7', 'K': '8', 'L': '9', 'M': '10', 'N': '11'
  };
  
  const updates = students.map(s => {
    // Extraer la letra base del nivel (por si viene como C1, D2, etc)
    const currentLevelChar = (s.academic_level || 'C').charAt(0).toUpperCase();
    const currentIndex = levelSequence.indexOf(currentLevelChar);
    
    let nextLevel = s.academic_level || 'C';
    let nextGrade = s.grade || 'Pre-Escolar';
    let nextStatus = s.estado_actual || 'Activo';

    if (currentIndex !== -1) {
      if (currentIndex < levelSequence.length - 1) {
        // Promoción normal a la siguiente letra
        const nextChar = levelSequence[currentIndex + 1];
        nextLevel = nextChar; // Se reinicia a la letra base del siguiente nivel
        nextGrade = gradeMapping[nextChar];
      } else {
        // Estaba en N (11°), se gradúa
        nextStatus = 'Graduado';
      }
    }

    return {
      id: s.id,
      document: s.document,
      grade: nextGrade,
      academic_level: nextLevel,
      estado_actual: nextStatus
    };
  });

  const { error } = await supabase.from('students').upsert(updates, { onConflict: 'id' });
  if (error) throw error;
  return true;
};

/**
 * RETIRO MASIVO: Cambia el estado y registra el historial académico
 */
export const retireStudentsInBulk = async (studentIds: string[], reason: string, observations: string, schoolYearId: string) => {
  const { error: updateError } = await supabase
    .from('students')
    .update({ estado_actual: reason })
    .in('id', studentIds);

  if (updateError) throw updateError;

  if (schoolYearId) {
    const { data: currentInfo } = await supabase
      .from('students')
      .select('id, grade, academic_level, atelier, modality')
      .in('id', studentIds);

    if (currentInfo) {
      const records = currentInfo.map(s => ({
        student_id: s.id,
        school_year_id: schoolYearId,
        grade: s.grade,
        academic_level: s.academic_level,
        atelier: s.atelier,
        modality: s.modality,
        status: reason,
        observations: observations
      }));

      const { error: historyError } = await supabase
        .from('student_academic_records')
        .upsert(records, { onConflict: 'student_id,school_year_id' });
        
      if (historyError) console.error("Error registrando historial de retiro:", historyError);
    }
  }

  return true;
};

/**
 * Importación masiva desde CSV: Valida existencia por documento para evitar re-creación
 */
export const syncStudentsFromSpreadsheet = async (
  csvData: any[]
): Promise<{ success: number; errors: number; skipped: number }> => {
  const mapped = csvData
    .map(row => ({
      document: String(row['ID'] || '').trim(),
      full_name: String(row['Seed'] || '').trim(),
      academic_level: String(row['Grupo'] || '').trim(),
      grade: String(row['Grado'] || '').trim(),
      calendario: String(row['Calendario'] || '').trim(),
      calendario_grupo: String(row['Calendario grupo'] || '').trim(),
      modality: String(row['Modalidad'] || '').trim(),
      atelier: String(row['Atelier'] || '').trim(),
      colegio: String(row['Colegio'] || '').trim(),
      rama: String(row['Rama'] || '').trim(),
      tl: String(row['TL'] || '').trim(),
      contrato: String(row['contrato'] || '').trim(),
      periodo: String(row['Periodo'] || '').trim(),
      cuenta_institucional: String(row['Cuenta institucional'] || '').trim(),
      nacimiento: String(row['Nacimiento'] || '').trim(),
      edad: String(row['Edad'] || '').trim(),
      rh: String(row['RH'] || '').trim(),
      programa_raices: String(row['Programa Raices'] || '').trim(),
      categoria_simat: String(row['Categoría Simat'] || '').trim(),
      dx1: String(row['DX1'] || '').trim(), 
      dx2: String(row['DX2'] || '').trim(), 
      complemento_cualitativo: String(row['Complemento Cualitativo'] || '').trim(), 
      programa: String(row['Programa'] || '').trim(), 
      estado_actual: String(row['Estado actual'] || '').trim(), 
      inicio: String(row['Inicio'] || '').trim(), 
      fin: String(row['Fin'] || '').trim(), 
      tipo_id_estudiante: String(row['Tipo ID estudiante'] || '').trim(), 
      cedula_a: String(row['Cédula A'] || '').trim(), 
      acudiente_academico: String(row['Acudiente Académico'] || '').trim(), 
      correo_a: String(row['Correo A'] || '').trim(), 
      telefono_a: String(row['Teléfono A'] || '').trim(), 
      acudiente_b: String(row['Acudiente B'] || '').trim(), 
      correo_b: String(row['Correo B'] || '').trim(), 
      telefono_b: String(row['Teléfono B'] || '').trim(), 
      cedula_financiero: String(row['Cédula financiero'] || '').trim(), 
      acudiente_financiero: String(row['Acudiente financiero'] || '').trim(), 
      correo_financiero: String(row['Correo financiero'] || '').trim(), 
      telefono_financiero: String(row['Teléfono financiero'] || '').trim(), 
      lugar_nacimiento: String(row['Lugar de nacimiento'] || '').trim(), 
      fecha_expedicion: String(row['Fecha de expedición'] || '').trim(), 
      lugar_expedicion: String(row['Lugar de expedición'] || '').trim(), 
      genero: String(row['Genero'] || '').trim(), 
      proceso: String(row['Proceso'] || '').trim(), 
      dossier: String(row['Dossier'] || '').trim(), 
      paz_y_salvo: String(row['Paz y Salvo'] || '').trim(), 
      codigo_estudiantil: String(row['Código Estudiantil'] || '').trim(), 
      poliza: String(row['Poliza'] || '').trim(), 
      fecha_activacion_poliza: String(row['Fecha activación poliza'] || '').trim(), 
      fecha_renovacion_poliza: String(row['Fecha renovación poliza'] || '').trim()
    }))
    .filter(s => s.document && s.full_name);

  // Obtener documentos existentes para filtrar
  const documentsInCsv = mapped.map(s => s.document);
  const { data: existing } = await supabase
    .from('students')
    .select('document')
    .in('document', documentsInCsv);
  
  const existingDocs = new Set(existing?.map(e => e.document) || []);
  
  // Filtrar solo los que NO existen
  const toInsert = mapped.filter(s => !existingDocs.has(s.document));
  const skippedCount = mapped.length - toInsert.length;

  let successCount = 0;
  let errorCount = 0;

  if (toInsert.length > 0) {
    for (const chunk of chunkArray(toInsert, 50)) {
      const { error } = await supabase.from('students').insert(chunk);
      if (error) {
          console.error("[Sync] Error en chunk:", error);
          errorCount += chunk.length;
      } else {
          successCount += chunk.length;
      }
    }
  }

  return { success: successCount, errors: errorCount, skipped: skippedCount };
};
