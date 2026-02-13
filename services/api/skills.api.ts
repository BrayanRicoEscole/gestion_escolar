

import { supabase } from './client';
import { isValidUUID } from './utils';
import { SkillSelection } from 'types';


export const getSkillSelections = async (): Promise<SkillSelection[]> => {
    const { data } = await supabase.from('student_skill_selections').select('*');
    return (data || []).map((s: any) => ({ 
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

      if (valid.length > 0) {
        const { error } = await supabase.from('student_skill_selections').insert(valid);
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