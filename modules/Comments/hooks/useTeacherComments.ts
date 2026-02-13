
import { useEffect, useMemo, useState } from 'react';
import { getCommentTemplates, getStudentComments, saveStudentComment } from '../../../services/api';
import { StudentComment, CommentTemplate } from '../../../types';
import { supabase } from '../../../services/api/client';

export function useTeacherComments({
  schoolYear,
  stationId,
  students,
}: {
  schoolYear: any;
  stationId: string;
  students: any[];
}) {
  const [templates, setTemplates] = useState<CommentTemplate[]>([]);
  const [comments, setComments] = useState<StudentComment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    if (!schoolYear || !stationId) return;

    (async () => {
      console.log("[useTeacherComments] Cargando comentarios iniciales para estación:", stationId);
      const [tpls, cms] = await Promise.all([
        getCommentTemplates(schoolYear.id),
        getStudentComments(stationId),
      ]);
      setTemplates(tpls);
      setComments(cms);
    })();
  }, [schoolYear, stationId]);

  // Suscripción Realtime para Comentarios
  useEffect(() => {
    if (!stationId) return;

    console.log("[Realtime:Comments] Suscribiendo a cambios para estación:", stationId);
    const channel = supabase
      .channel(`realtime_comments_${stationId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'api', 
          table: 'student_comments',
          filter: `station_id=eq.${stationId}` 
        },
        (payload) => {
          console.debug("[Realtime:Comment] Cambio recibido:", payload.eventType);
          const newComment = payload.new as any;
          
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any).student_id;
            setComments(prev => prev.filter(c => c.studentId !== oldId));
            return;
          }

          if (!newComment) return;

          const mapped: StudentComment = {
            studentId: newComment.student_id,
            stationId: newComment.station_id,
            convivenciaGrade: newComment.convivencia_grade,
            academicCons: newComment.academic_cons || '',
            academicNon: newComment.academic_non || '',
            emotionalSkills: newComment.emotional_skills || '',
            talents: newComment.talents || '',
            socialInteraction: newComment.social_interaction || '',
            challenges: newComment.challenges || '',
            piarDesc: newComment.piar_desc || '',
            // Fix: property name was learningCropDesc, should be learning_crop_desc
            learning_crop_desc: newComment.learning_crop_desc || '',
            comentary: newComment.comentary || '',
            comentaryStatus: newComment.comentary_status || 'draft',
            comentaryQuality: newComment.comentary_quality || 0,
            aiSuggestion: newComment.ai_suggestion || ''
          };

          setComments(prev => {
            const rest = prev.filter(c => c.studentId !== mapped.studentId);
            return [...rest, mapped];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stationId]);

  // Mantener la selección válida
  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId('');
      return;
    }
    if (!students.find(s => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const currentComment = useMemo(() => {
    if (!selectedStudentId) return null;
    return (
      comments.find(
        c =>
          c.studentId === selectedStudentId &&
          c.stationId === stationId
      ) ?? {
        studentId: selectedStudentId,
        stationId,
        convivenciaGrade: null,
        academicCons: '',
        academicNon: '',
        emotionalSkills: '',
        talents: '',
        socialInteraction: '',
        challenges: '',
        piarDesc: '',
        // Fix: property name was learningCropDesc, should be learning_crop_desc
        learning_crop_desc: '',
      }
    );
  }, [comments, selectedStudentId, stationId]);

  const updateField = async (field: keyof StudentComment, value: any) => {
    let finalValue = value;

    if (field === 'convivenciaGrade') {
      const valStr = value === null || value === undefined ? '' : String(value);
      if (valStr !== '' && valStr !== '1' && valStr !== '5') return;
      finalValue = valStr === '' ? null : Number(valStr);
    }

    const updatedComment = { ...currentComment!, [field]: finalValue };

    // 1. Local state (Optimistic)
    setComments(prev => {
      const rest = prev.filter(
        c => !(c.studentId === selectedStudentId && c.stationId === stationId)
      );
      return [...rest, updatedComment];
    });

    // 2. Immediate Autosave
    setIsSaving(true);
    console.info(`[Autosave:Comment] Guardando campo ${field} para estudiante ${selectedStudentId}...`);
    try {
      await saveStudentComment(updatedComment);
      console.debug(`[Autosave:Comment] Éxito.`);
    } catch (e) {
      console.error("[Autosave:Comment] Error al guardar campo:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const insertTemplate = (field: keyof StudentComment, text: string) => {
    const base = (currentComment?.[field] as string) || '';
    updateField(field, base ? `${base}\n${text}` : text);
  };

  return {
    templates,
    selectedStudentId,
    setSelectedStudentId,
    currentComment,
    updateField,
    insertTemplate,
    isSaving
  };
}
