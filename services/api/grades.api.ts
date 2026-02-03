import { supabase } from './client';
import { GradeEntry, LevelingGrade } from 'types';
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
