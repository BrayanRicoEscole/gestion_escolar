
import { createClient } from '@supabase/supabase-js';
import { 
  SchoolYear, Student, GradeEntry, SkillSelection, Subject, Skill, 
  LevelingGrade, CommentTemplate, StudentComment 
} from '../types';
import { MOCK_INITIAL_SCHOOL_YEAR, MOCK_INITIAL_STUDENTS } from './mockInitialData';

const SUPABASE_URL = 'https://gzdiljudmdezdkntnhml.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGlsanVkbWRlemRrbnRuaG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzQ5OTEsImV4cCI6MjA4NTExMDk5MX0.Ui20tkVIXRslewslnM7vzDKkftdpxLnFBZn3KzoOue0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'api'
  }
});

const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const api = {
  getSchoolYear: async (): Promise<SchoolYear> => {
    try {
      const { data: yearData, error: yearError } = await supabase.from('school_year_full').select('*').single();
      if (yearError || !yearData) throw yearError;
      const { data: skillsData } = await supabase.from('subject_skills').select('*');
      
      const year = {
        id: yearData.id,
        name: yearData.name,
        stations: (yearData.stations || []).map((st: any) => ({
          id: st.id, name: st.name, weight: Number(st.weight || 0),
          startDate: st.start_date, endDate: st.end_date,
          moments: (st.learning_moments || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((m: any) => ({
            id: m.id, name: m.name, weight: Number(m.weight || 0),
            sections: (m.sections || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((s: any) => ({
              id: s.id, name: s.name, weight: Number(s.weight || 0),
              gradeSlots: (s.grade_slots || []).map((g: any) => ({ id: g.id, name: g.name, weight: Number(g.weight || 0), scale: g.scale || '1 - 5' }))
            }))
          })),
          subjects: (st.subjects || []).map((sub: any) => ({
            id: sub.id, name: sub.name, area: sub.area, lab: sub.lab,
            courses: Array.isArray(sub.courses) ? sub.courses : [],
            modalities: Array.isArray(sub.modalities) ? sub.modalities : [],
            levels: Array.isArray(sub.levels) ? sub.levels : [],
            skills: skillsData?.filter(s => s.subject_id === sub.id).map(s => ({ id: s.id, level: s.level, description: s.description })) || []
          }))
        }))
      };
      return year;
    } catch (e) { return MOCK_INITIAL_SCHOOL_YEAR; }
  },

  getStudents: async (): Promise<Student[]> => {
    const { data } = await supabase.from('students').select('*').order('full_name', { ascending: true });
    return (data || []).map(s => ({ id: s.id, full_name: s.full_name, document: s.document, academic_level: s.academic_level, grade: s.grade, atelier: s.atelier, modality: s.modality }));
  },

  getGrades: async (): Promise<GradeEntry[]> => {
    const { data } = await supabase.from('grades').select('*');
    return (data || []).map(g => ({ studentId: g.student_id, slotId: g.slot_id, subjectId: g.subject_id, value: g.value }));
  },

  saveGrades: async (grades: GradeEntry[]): Promise<void> => {
    console.log(`[DB] Guardando ${grades.length} calificaciones...`);
    const valid = grades.filter(g => isValidUUID(g.studentId)).map(g => ({ student_id: g.studentId, slot_id: g.slotId, subject_id: g.subjectId, value: g.value }));
    if (valid.length > 0) {
      const { error } = await supabase.from('grades').upsert(valid, { onConflict: 'student_id,slot_id,subject_id' });
      if (error) {
        console.error("[DB] Error al guardar calificaciones:", error);
        throw error;
      }
      console.log("[DB] Calificaciones guardadas exitosamente.");
    }
  },

  getLevelingGrades: async (): Promise<LevelingGrade[]> => {
    const { data } = await supabase.from('leveling_grades').select('*');
    return (data || []).map(l => ({ studentId: l.student_id, subjectId: l.subject_id, stationId: l.station_id, value: l.value }));
  },

  saveLevelingGrades: async (leveling: LevelingGrade[]): Promise<void> => {
    console.log(`[DB] Guardando ${leveling.length} nivelaciones...`);
    const valid = leveling.filter(l => isValidUUID(l.studentId)).map(l => ({ student_id: l.studentId, subject_id: l.subjectId, station_id: l.stationId, value: l.value }));
    if (valid.length > 0) {
      const { error } = await supabase.from('leveling_grades').upsert(valid, { onConflict: 'student_id,subject_id,station_id' });
      if (error) {
        console.error("[DB] Error al guardar nivelaciones:", error);
        throw error;
      }
      console.log("[DB] Nivelaciones guardadas exitosamente.");
    }
  },

  getSkillSelections: async (): Promise<SkillSelection[]> => {
    const { data } = await supabase.from('student_skill_selections').select('*');
    return (data || []).map((s: any) => ({ 
      studentId: s.student_id, 
      skillId: s.skill_id, 
      subjectId: s.subject_id, 
      stationId: s.station_id 
    }));
  },

  saveSkillSelections: async (selections: SkillSelection[], subjectId: string, stationId: string): Promise<void> => {
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
  },

  updateSchoolYear: async (year: SchoolYear): Promise<void> => {
    console.log(`[DB] Actualizando año escolar ${year.name}...`);
    const { error } = await supabase.from('school_years').upsert({ id: year.id, name: year.name });
    if (error) {
      console.error("[DB] Error al actualizar año escolar:", error);
      throw error;
    }
    console.log("[DB] Año escolar actualizado.");
  },

  getCommentTemplates: async (schoolYearId: string): Promise<CommentTemplate[]> => {
    const { data } = await supabase.from('comment_templates').select('*').eq('school_year_id', schoolYearId);
    return (data || []).map(t => ({
      id: t.id, schoolYearId: t.school_year_id, academicLevel: t.academic_level, fieldKey: t.field_key, content: t.content
    }));
  },

  saveCommentTemplates: async (templates: CommentTemplate[]): Promise<void> => {
    console.log(`[DB] Guardando ${templates.length} plantillas de comentarios...`);
    const payload = templates.map(t => ({
      id: t.id, school_year_id: t.schoolYearId, academic_level: t.academicLevel, field_key: t.fieldKey, content: t.content
    }));
    if (payload.length > 0) {
      const { error } = await supabase.from('comment_templates').upsert(payload);
      if (error) {
        console.error("[DB] Error al guardar plantillas:", error);
        throw error;
      }
      console.log("[DB] Plantillas guardadas.");
    }
  },

  getStudentComments: async (stationId: string): Promise<StudentComment[]> => {
    const { data } = await supabase.from('student_comments').select('*').eq('station_id', stationId);
    return (data || []).map(c => ({
      studentId: c.student_id, stationId: c.station_id, convivenciaGrade: c.convivencia_grade,
      academicCons: c.academic_cons || '', academicNon: c.academic_non || '',
      emotionalSkills: c.emotional_skills || '', talents: c.talents || '',
      socialInteraction: c.social_interaction || '', challenges: c.challenges || '',
      piarDesc: c.piar_desc || '', learningCropDesc: c.learning_crop_desc || '',
      comentary: c.comentary || '',
      comentaryStatus: c.comentary_status || 'draft',
      comentaryQuality: c.comentary_quality || 0,
      aiSuggestion: c.ai_suggestion || ''
    }));
  },

  saveStudentComment: async (comment: StudentComment): Promise<void> => {
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
      learning_crop_desc: comment.learningCropDesc,
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
  }
};
