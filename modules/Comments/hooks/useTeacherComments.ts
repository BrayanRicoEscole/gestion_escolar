
import { useEffect, useMemo, useState } from 'react';
import { getCommentTemplates, getStudentComments } from '../../../services/api';
import { StudentComment, CommentTemplate } from '../../../types';

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

  useEffect(() => {
    if (!schoolYear || !stationId) return;

    (async () => {
      const [tpls, cms] = await Promise.all([
        getCommentTemplates(schoolYear.id),
        getStudentComments(stationId),
      ]);
      setTemplates(tpls);
      setComments(cms);
    })();
  }, [schoolYear, stationId]);

  // keep selection valid
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
        learningCropDesc: '',
      }
    );
  }, [comments, selectedStudentId, stationId]);

  const updateField = (field: keyof StudentComment, value: any) => {
    let finalValue = value;

    if (field === 'convivenciaGrade') {
      const valStr = value === null || value === undefined ? '' : String(value);
      if (valStr !== '' && valStr !== '1' && valStr !== '5') return;
      finalValue = valStr === '' ? null : Number(valStr);
    }

    setComments(prev => {
      const rest = prev.filter(
        c =>
          !(
            c.studentId === selectedStudentId &&
            c.stationId === stationId
          )
      );
      return [...rest, { ...currentComment!, [field]: finalValue }];
    });
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
  };
}
