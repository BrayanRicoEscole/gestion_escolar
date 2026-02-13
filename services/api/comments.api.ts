
import { supabase } from './client';
import { CommentTemplate, StudentComment } from 'types';

export const getCommentTemplates=  async (schoolYearId: string): Promise<CommentTemplate[]> => {
    const { data } = await supabase.from('comment_templates').select('*').eq('school_year_id', schoolYearId);
    return (data || []).map(t => ({
      id: t.id, 
      schoolYearId: t.school_year_id, 
      academicLevel: t.academic_level, 
      fieldKey: t.field_key, 
      content: t.content
    }));
  };

export const saveCommentTemplates= async (templates: CommentTemplate[]): Promise<void> => {
    console.log(`[DB] Guardando ${templates.length} plantillas de comentarios...`);
    const payload = templates.map(t => ({
      id: t.id, 
      school_year_id: t.schoolYearId, 
      academic_level: t.academicLevel, 
      field_key: t.fieldKey, 
      content: t.content
    }));
    if (payload.length > 0) {
      const { error } = await supabase.from('comment_templates').upsert(payload);
      if (error) {
        console.error("[DB] Error al guardar plantillas:", error);
        throw error;
      }
      console.log("[DB] Plantillas guardadas.");
    }
  };

export const getStudentComments= async (stationId: string): Promise<StudentComment[]> => {
    const { data } = await supabase.from('student_comments').select('*').eq('station_id', stationId);
    return (data || []).map(c => ({
      studentId: c.student_id, stationId: c.station_id, convivenciaGrade: c.convivencia_grade,
      academicCons: c.academic_cons || '', academicNon: c.academic_non || '',
      emotionalSkills: c.emotional_skills || '', talents: c.talents || '',
      socialInteraction: c.social_interaction || '', challenges: c.challenges || '',
      piarDesc: c.piar_desc || '', learning_crop_desc: c.learning_crop_desc || '',
      comentary: c.comentary || '',
      comentaryStatus: c.comentary_status || 'draft',
      comentaryQuality: c.comentary_quality || 0,
      aiSuggestion: c.ai_suggestion || ''
    }));
  };

export const saveStudentComment= async (comment: StudentComment): Promise<void> => {
    console.log(`[DB] Guardando comentario para estudiante ${comment.studentId} en estación ${comment.stationId}...`);
    const payload = {
      student_id: comment.studentId, 
      station_id: comment.stationId, 
      convivencia_grade: comment.convivenciaGrade,
      academic_cons: comment.academicCons, 
      academic_non: comment.academicNon,
      emotional_skills: comment.emotionalSkills, 
      talents: comment.talents,
      social_interaction: comment.socialInteraction, 
      challenges: comment.challenges,
      piar_desc: comment.piarDesc, 
      learning_crop_desc: comment.learning_crop_desc, 
      comentary: comment.comentary,
      comentary_status: comment.comentaryStatus,
      comentary_quality: comment.comentaryQuality,
      ai_suggestion: comment.aiSuggestion
    };
    const { error } = await supabase.from('student_comments').upsert(payload, { onConflict: 'student_id,station_id' });
    if (error) {
      console.error("[DB] Error al guardar comentario:", error);
      throw error;
    }
    console.log("[DB] Comentario guardado exitosamente.");
};
