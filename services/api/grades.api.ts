import { supabase } from './client';
import { GradeEntry, LevelingGrade, SkillSelection } from 'types';
import { isValidUUID } from './utils';

export const getGrades = async (subjectIds?: string[], studentIds?: string[]): Promise<GradeEntry[]> => {
  const PAGE_SIZE = 5000;
  let allGrades: any[] = [];
  let from = 0;
  let to = PAGE_SIZE - 1;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from('grades').select('*').range(from, to);
    
    if (subjectIds && subjectIds.length > 0) {
      query = query.in('subject_id', subjectIds);
    }
    if (studentIds && studentIds.length > 0) {
      query = query.in('student_id', studentIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    if (data && data.length > 0) {
      allGrades = [...allGrades, ...data];
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
        to += PAGE_SIZE;
      }
    } else {
      hasMore = false;
    }
    
    // Safety break to prevent infinite loops if something goes wrong
    if (allGrades.length > 50000) break;
  }

  return allGrades.map(g => ({
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
 * COPIAR DATOS DE ESTACIÓN:
 * Reclica la estructura (momentos, secciones, slots) y las notas de una estación a otra.
 */
export const copyStationData = async (
  sourceStationId: string,
  targetStationId: string,
  subjectId: string,
  schoolYearId: string
): Promise<{ success: boolean; message: string }> => {
  console.group(`[API:CopyStation] De ${sourceStationId} a ${targetStationId}`);
  
  try {
    // 1. Obtener estructura de la fuente
    const { data: sourceMoments, error: mError } = await supabase
      .from('learning_moments')
      .select('*, sections(*, grade_slots(*))')
      .eq('station_id', sourceStationId);
    
    if (mError) throw mError;
    if (!sourceMoments || sourceMoments.length === 0) {
      throw new Error("La estación de origen no tiene momentos configurados.");
    }

    // 2. Obtener estructura del destino (para ver si ya tiene algo)
    const { data: targetMoments } = await supabase
      .from('learning_moments')
      .select('id')
      .eq('station_id', targetStationId);
    
    // Si el destino ya tiene momentos, no copiamos la estructura para evitar duplicidad
    // pero sí intentaremos mapear por nombre si el usuario quiere copiar notas.
    // Para este requerimiento, asumiremos que si no hay momentos, los creamos.
    
    const slotMapping = new Map<string, string>(); // source_slot_id -> target_slot_id

    if (!targetMoments || targetMoments.length === 0) {
      console.log("-> Copiando estructura...");
      for (const m of sourceMoments) {
        const { data: newMoment, error: nmError } = await supabase
          .from('learning_moments')
          .insert({
            station_id: targetStationId,
            name: m.name,
            weight: m.weight,
            sort_order: m.sort_order
          })
          .select()
          .single();
        
        if (nmError) throw nmError;

        for (const sec of m.sections) {
          const { data: newSec, error: nsError } = await supabase
            .from('sections')
            .insert({
              moment_id: newMoment.id,
              name: sec.name,
              weight: sec.weight,
              sort_order: sec.sort_order
            })
            .select()
            .single();
          
          if (nsError) throw nsError;

          for (const slot of sec.grade_slots) {
            const { data: newSlot, error: nslError } = await supabase
              .from('grade_slots')
              .insert({
                section_id: newSec.id,
                name: slot.name,
                weight: slot.weight,
                scale: slot.scale
              })
              .select()
              .single();
            
            if (nslError) throw nslError;
            slotMapping.set(slot.id, newSlot.id);
          }
        }
      }
    } else {
      // Mapear por nombre si ya existen
      console.log("-> Mapeando estructura existente por nombre...");
      const { data: fullTargetMoments } = await supabase
        .from('learning_moments')
        .select('*, sections(*, grade_slots(*))')
        .eq('station_id', targetStationId);
      
      sourceMoments.forEach(sm => {
        const tm = fullTargetMoments?.find(t => t.name === sm.name);
        if (tm) {
          sm.sections.forEach((ss: any) => {
            const ts = tm.sections.find((t: any) => t.name === ss.name);
            if (ts) {
              ss.grade_slots.forEach((ssl: any) => {
                const tsl = ts.grade_slots.find((t: any) => t.name === ssl.name);
                if (tsl) slotMapping.set(ssl.id, tsl.id);
              });
            }
          });
        }
      });
    }

    // 3. Copiar Notas
    console.log(`-> Copiando notas para materia ${subjectId}...`);
    const sourceSlotIds = Array.from(slotMapping.keys());
    if (sourceSlotIds.length > 0) {
      const { data: sourceGrades, error: gError } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', subjectId)
        .in('slot_id', sourceSlotIds);
      
      if (gError) throw gError;

      if (sourceGrades && sourceGrades.length > 0) {
        const targetGrades = sourceGrades.map(g => ({
          student_id: g.student_id,
          subject_id: g.subject_id,
          slot_id: slotMapping.get(g.slot_id),
          value: g.value
        })).filter(g => g.slot_id);

        if (targetGrades.length > 0) {
          const { error: upsertError } = await supabase
            .from('grades')
            .upsert(targetGrades, { onConflict: 'student_id,slot_id,subject_id' });
          
          if (upsertError) throw upsertError;
          console.log(`-> ${targetGrades.length} notas copiadas con éxito.`);
        }
      }
    }

    // 4. Copiar Notas de Nivelación
    console.log(`-> Copiando notas de nivelación para materia ${subjectId}...`);
    const { data: sourceLeveling, error: lvError } = await supabase
      .from('leveling_grades')
      .select('*')
      .match({
        subject_id: subjectId,
        station_id: sourceStationId
      });
    
    if (lvError) throw lvError;

    if (sourceLeveling && sourceLeveling.length > 0) {
      const targetLeveling = sourceLeveling.map(l => ({
        student_id: l.student_id,
        subject_id: l.subject_id,
        station_id: targetStationId,
        value: l.value
      }));

      const { error: upsertLvError } = await supabase
        .from('leveling_grades')
        .upsert(targetLeveling, { onConflict: 'student_id,subject_id,station_id' });
      
      if (upsertLvError) throw upsertLvError;
      console.log(`-> ${targetLeveling.length} notas de nivelación copiadas.`);
    }

    console.groupEnd();
    return { success: true, message: "Estructura y notas copiadas con éxito." };
  } catch (err: any) {
    console.error("Error en copyStationData:", err);
    console.groupEnd();
    return { success: false, message: err.message || "Error desconocido al copiar datos." };
  }
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
  const processedIds = new Set<string>();

  // Clasificar
  csvRows.forEach(row => {
    const student = studentMap.get(row.document);
    if (!student) {
      missingDocuments.push(`${row.document} (${row.fullName || 'N/A'})`);
    } else if (!processedIds.has(student.id)) {
      studentsToProcess.push({ ...row, dbId: student.id, dbInfo: student });
      processedIds.add(student.id);
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
  const levelingPayload: any[] = [];

  // Obtener habilidades existentes para este sujeto
  const { data: existingSkills, error: skillsFetchError } = await supabase
    .from('subject_skills')
    .select('id, level, description')
    .eq('subject_id', subjectId);

  if (skillsFetchError) {
    console.error("[Import] Error fetching existing skills:", skillsFetchError);
    throw skillsFetchError;
  }

  // Obtener niveles del sujeto para fallback
  const { data: subjectData, error: subjectFetchError } = await supabase
    .from('subjects')
    .select('levels')
    .eq('id', subjectId)
    .single();
  
  if (subjectFetchError) {
    console.error("[Import] Error fetching subject levels:", subjectFetchError);
  }
  
  const subjectLevels = (subjectData?.levels || ['C']).map((l: string) => l.charAt(0).toUpperCase());
  const defaultLevel = subjectLevels[0] || 'C';

  const skillCache = new Map<string, string>(); // "level-description" -> id
  existingSkills?.forEach(sk => {
    const levelValue = sk.level || '';
    const levelKey = levelValue ? levelValue.charAt(0).toUpperCase() : defaultLevel;
    const descKey = (sk.description || '').trim();
    if (descKey) {
      skillCache.set(`${levelKey}-${descKey}`, sk.id);
    }
  });

  // Identificar habilidades nuevas a crear
  const skillsToCreate: { subject_id: string; level: string; description: string }[] = [];
  const seenInImport = new Set<string>();

  studentsToProcess.forEach(s => {
    const rawLevel = s.dbInfo.academic_level || '';
    const firstChar = rawLevel ? rawLevel.charAt(0).toUpperCase() : '';
    const levelToUse = (firstChar && subjectLevels.includes(firstChar)) ? firstChar : defaultLevel;

    (s.skillDescriptions || []).forEach((desc: string) => {
      const trimmedDesc = desc.trim();
      if (!trimmedDesc) return;

      const key = `${levelToUse}-${trimmedDesc}`;
      if (!skillCache.has(key) && !seenInImport.has(key)) {
        skillsToCreate.push({
          subject_id: subjectId,
          level: levelToUse,
          description: trimmedDesc
        });
        seenInImport.add(key);
      }
    });
  });

  // Crear habilidades faltantes
  if (skillsToCreate.length > 0) {
    console.log(`[Import] Creating ${skillsToCreate.length} new skills...`);
    const { data: newSkills, error: createError } = await supabase
      .from('subject_skills')
      .insert(skillsToCreate)
      .select();
    
    if (createError) {
      console.error("[Import] Error creating new skills:", createError);
      throw createError;
    }

    newSkills?.forEach(sk => {
      const levelValue = sk.level || '';
      const levelKey = levelValue ? levelValue.charAt(0).toUpperCase() : defaultLevel;
      const descKey = (sk.description || '').trim();
      if (descKey) {
        skillCache.set(`${levelKey}-${descKey}`, sk.id);
      }
    });
  }

  studentsToProcess.forEach(s => {
    s.grades.forEach((g: any) => {
      gradesPayload.push({
        student_id: s.dbId,
        slot_id: g.slotId,
        subject_id: subjectId,
        value: g.value
      });
    });

    if (s.levelingValue !== null && s.levelingValue !== undefined) {
      levelingPayload.push({
        student_id: s.dbId,
        subject_id: subjectId,
        station_id: stationId,
        value: s.levelingValue
      });
    }

    const rawLevel = s.dbInfo.academic_level || '';
    const firstChar = rawLevel ? rawLevel.charAt(0).toUpperCase() : '';
    const levelToUse = (firstChar && subjectLevels.includes(firstChar)) ? firstChar : defaultLevel;

    // Deduplicar habilidades por estudiante para evitar errores de PK duplicada en el mismo insert
    const uniqueDescriptions = Array.from(new Set((s.skillDescriptions || []).map((d: string) => d.trim()).filter((d: string) => d)));
    uniqueDescriptions.forEach((desc: string) => {
      const skillId = skillCache.get(`${levelToUse}-${desc}`);
      if (skillId) {
        skillsPayload.push({
          student_id: s.dbId,
          skill_id: skillId,
          subject_id: subjectId,
          station_id: stationId
        });
      } else {
        console.warn(`[Import] Skill not found in cache after creation attempt: ${levelToUse}-${desc}`);
      }
    });
  });

  // 5. Ejecutar UPSERTS
  if (gradesPayload.length > 0) {
    const { error: gError } = await supabase.from('grades').upsert(gradesPayload, { onConflict: 'student_id,slot_id,subject_id' });
    if (gError) throw gError;
  }

  if (levelingPayload.length > 0) {
    const { error: lError } = await supabase.from('leveling_grades').upsert(levelingPayload, { onConflict: 'student_id,subject_id,station_id' });
    if (lError) throw lError;
  }

  if (skillsPayload.length > 0) {
    console.log(`[Import] Saving ${skillsPayload.length} skill selections...`);
    
    // Deduplicar el payload internamente para evitar conflictos en el mismo lote
    const uniqueSkillsPayload = Array.from(new Map(
      skillsPayload.map(item => [`${item.student_id}-${item.skill_id}-${item.subject_id}-${item.station_id}`, item])
    ).values());

    const { error: sError } = await supabase
      .from('student_skill_selections')
      .upsert(uniqueSkillsPayload, { onConflict: 'student_id,skill_id,subject_id,station_id' });
    
    if (sError) {
      console.error("[Import] Error upserting skill selections:", sError);
      throw sError;
    }
  }

  console.groupEnd();
  return { 
    successCount: studentsToProcess.length, 
    missingDocuments, 
    enrolledCount: toEnroll.length 
  };
};

export const getLevelingGrades = async (subjectIds?: string[], studentIds?: string[]): Promise<LevelingGrade[]> => {
  const PAGE_SIZE = 5000;
  let allLeveling: any[] = [];
  let from = 0;
  let to = PAGE_SIZE - 1;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from('leveling_grades').select('*').range(from, to);
    
    if (subjectIds && subjectIds.length > 0) {
      query = query.in('subject_id', subjectIds);
    }
    if (studentIds && studentIds.length > 0) {
      query = query.in('student_id', studentIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    if (data && data.length > 0) {
      allLeveling = [...allLeveling, ...data];
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
        to += PAGE_SIZE;
      }
    } else {
      hasMore = false;
    }
    
    if (allLeveling.length > 20000) break;
  }

  return allLeveling.map(l => ({
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