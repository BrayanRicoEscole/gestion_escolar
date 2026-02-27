

import { supabase } from './client';
import { isValidUUID } from './utils';
import { SkillSelection } from 'types';


export const getSkillSelections = async (subjectIds?: string[], studentIds?: string[]): Promise<SkillSelection[]> => {
    const PAGE_SIZE = 5000;
    let allSelections: any[] = [];
    let from = 0;
    let to = PAGE_SIZE - 1;
    let hasMore = true;

    while (hasMore) {
      let query = supabase.from('student_skill_selections').select('*').range(from, to);
      
      if (subjectIds && subjectIds.length > 0) {
        query = query.in('subject_id', subjectIds);
      }
      if (studentIds && studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      if (data && data.length > 0) {
        allSelections = [...allSelections, ...data];
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          from += PAGE_SIZE;
          to += PAGE_SIZE;
        }
      } else {
        hasMore = false;
      }
      
      if (allSelections.length > 30000) break;
    }

    return allSelections.map((s: any) => ({ 
      studentId: s.student_id, 
      skillId: s.skill_id, 
      subjectId: s.subject_id, 
      stationId: s.station_id 
    }));
  };

export const saveSkillSelections= async (selections: SkillSelection[], subjectId: string, stationId: string): Promise<void> => {
    console.log(`[DB] Guardando habilidades para materia ${subjectId}...`);
    if (!isValidUUID(subjectId) || !isValidUUID(stationId)) return;

    try {
      // 1. Limpiar selecciones previas para este contexto
      await supabase.from('student_skill_selections').delete().match({ subject_id: subjectId, station_id: stationId });
      
      const valid = selections
        .filter(s => s.subjectId === subjectId && s.stationId === stationId && isValidUUID(s.studentId))
        // Fixed: Use camelCase properties from SkillSelection interface
        .map(s => ({ 
          student_id: s.studentId, 
          skill_id: s.skillId, 
          subject_id: s.subjectId, 
          station_id: s.stationId 
        }));

      // Deduplicar para evitar errores de PK duplicada en el mismo insert
      const deduplicated = Array.from(new Set(valid.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

      if (deduplicated.length > 0) {
        const { error } = await supabase.from('student_skill_selections').insert(deduplicated);
        if (error) {
          console.error("[DB] Error al guardar habilidades:", error);
          // Si es un error de FK, informamos al usuario que debe matricular primero
          if (error.code === '23503') {
            throw new Error("No se pueden guardar habilidades de un estudiante que no ha sido matriculado oficialmente en la base de datos.");
          }
          throw error;
        }
        console.log("[DB] Habilidades guardadas exitosamente.");
      }
    } catch (e) {
      console.error("[DB:Skills] Error fatal:", e);
      throw e;
    }
  };