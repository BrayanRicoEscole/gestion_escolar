
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
    await supabase.from('student_skill_selections').delete().match({ subject_id: subjectId, station_id: stationId });
    const valid = selections.filter(s => s.subjectId === subjectId && s.stationId === stationId).map(s => ({ 
      student_id: s.studentId, 
      skill_id: s.skillId, 
      subject_id: s.subjectId, 
      station_id: s.stationId 
    }));
    if (valid.length > 0) {
      const { error } = await supabase.from('student_skill_selections').insert(valid);
      if (error) {
        console.error("[DB] Error al guardar habilidades:", error);
        throw error;
      }
      console.log("[DB] Habilidades guardadas exitosamente.");
    }
  };
