import { supabase } from './client';
import { StationReport, GradeEntry, LevelingGrade, SkillSelection, Station, Subject } from '../../types';

export const getStationReport = async (
  studentId: string,
  schoolYearId: string,
  stationId: string
): Promise<StationReport | null> => {
  const { data, error } = await supabase
    .from('station_reports')
    .select('id, student_id, school_year_id, station_id, subject_data, subject_skills, global_average, is_global_manual, global_edited_by, global_edited_at, station_comment, created_at, updated_at')
    .eq('student_id', studentId)
    .eq('school_year_id', schoolYearId)
    .eq('station_id', stationId)
    .maybeSingle();

  if (error) {
    console.error("[Reports API] Error in getStationReport:", error);
    if (error.code !== 'PGRST116') throw error;
  }
  return data;
};

export const saveStationReport = async (report: Partial<StationReport>): Promise<StationReport> => {
  const { data, error } = await supabase
    .from('station_reports')
    .upsert({
      ...report,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id,school_year_id,station_id' })
    .select('id, student_id, school_year_id, station_id, subject_data, subject_skills, global_average, is_global_manual, global_edited_by, global_edited_at, station_comment, created_at, updated_at')
    .maybeSingle();

  if (error) {
    console.error("[Reports API] Error in saveStationReport:", error);
    throw error;
  }
  return data;
};

/**
 * Calculates or refreshes the station report for a student.
 * This is the "lazy" calculation logic.
 */
export const refreshStationReport = async (
  studentId: string,
  schoolYearId: string,
  stationId: string,
  station: Station,
  subjects: Subject[]
): Promise<StationReport> => {
  // 1. Get existing report to preserve manual overrides
  const existing = await getStationReport(studentId, schoolYearId, stationId);

  // 2. Fetch FULL station structure directly from tables to ensure we have moments/sections/slots
  const { data: momentsData, error: momentsError } = await supabase
    .from('learning_moments')
    .select('*, sections(*, grade_slots(*))')
    .eq('station_id', stationId);

  if (momentsError) {
    console.error("[Reports API] Error fetching moments structure:", momentsError);
  }

  const fullMoments = (momentsData || []) as any[];
  const slotIds = fullMoments.flatMap(m => m.sections?.flatMap((s: any) => s.grade_slots?.map((gs: any) => gs.id)) || []);

  if (slotIds.length === 0) {
    console.warn(`[Reports API] No slots found for station ${stationId}. Check if moments/sections/slots exist.`);
  }

  // 3. Fetch all grades for this student and station's slots
  const { data: gradesData, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId)
    .in('slot_id', slotIds.length > 0 ? slotIds : ['none']);

  if (gradesError) {
    console.error("[Reports API] Error fetching grades:", gradesError);
  }

  const grades = (gradesData || []) as any[];

  // 4. Fetch skill selections
  const { data: skillsData, error: skillsError } = await supabase
    .from('student_skill_selections')
    .select('*, subject_skills(*)')
    .match({ student_id: studentId, station_id: stationId });

  if (skillsError) {
    console.error("[Reports API] Error fetching skills:", skillsError);
  }

  // 5. Calculate averages per subject
  const subjectData: StationReport['subject_data'] = { ...(existing?.subject_data || {}) };
  const subjectSkills: StationReport['subject_skills'] = {};

  for (const subject of subjects) {
    // Skip if manually edited by support
    if (subjectData[subject.id]?.is_manual) {
      continue;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    fullMoments.forEach(moment => {
      let momentScore = 0;
      let momentWeight = 0;

      moment.sections?.forEach((section: any) => {
        let sectionScore = 0;
        let sectionWeight = 0;

        section.grade_slots?.forEach((slot: any) => {
          const grade = grades.find(g => g.slot_id === slot.id && g.subject_id === subject.id);
          if (grade && grade.value !== null && grade.value !== undefined) {
            const w = (slot.weight || 0) > 0 ? slot.weight / 100 : 1;
            sectionScore += grade.value * w;
            sectionWeight += w;
          }
        });

        if (sectionWeight > 0) {
          const normalizedSectionScore = sectionScore / sectionWeight;
          const sw = (section.weight || 0) > 0 ? section.weight / 100 : 1;
          momentScore += normalizedSectionScore * sw;
          momentWeight += sw;
        }
      });

      if (momentWeight > 0) {
        const normalizedMomentScore = momentScore / momentWeight;
        const mw = (moment.weight || 0) > 0 ? moment.weight / 100 : 1;
        totalWeightedScore += normalizedMomentScore * mw;
        totalWeight += mw;
      }
    });

    const finalValue = totalWeight > 0 ? Number((totalWeightedScore / totalWeight).toFixed(2)) : null;
    
    subjectData[subject.id] = {
      value: finalValue,
      is_manual: false
    };

    // Skills
    const skillSel = (skillsData || []).find(s => s.subject_id === subject.id);
    if (skillSel && skillSel.subject_skills) {
      subjectSkills[subject.id] = {
        skill_id: skillSel.skill_id,
        description: skillSel.subject_skills.description
      };
    }
  }

  // 6. Global Average
  let globalAvg = 0;
  if (!existing?.is_global_manual) {
    // Solo promediar asignaturas que tengan una nota mayor a 0 (asignaturas que el estudiante efectivamente vio)
    const values = Object.values(subjectData)
      .map((d: any) => d.value)
      .filter(v => v !== undefined && v !== null && v > 0);
    
    globalAvg = values.length > 0 ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
  } else {
    globalAvg = existing.global_average;
  }

  // 7. Save and return
  return await saveStationReport({
    student_id: studentId,
    school_year_id: schoolYearId,
    station_id: stationId,
    subject_data: subjectData,
    subject_skills: subjectSkills,
    global_average: globalAvg,
    is_global_manual: existing?.is_global_manual || false,
    station_comment: existing?.station_comment
  });
};

export const getAllStationReports = async (
  schoolYearId: string, 
  stationId: string,
  studentIds?: string[]
): Promise<StationReport[]> => {
  let query = supabase
    .from('station_reports')
    .select('id, student_id, school_year_id, station_id, subject_data, subject_skills, global_average, is_global_manual, global_edited_by, global_edited_at, station_comment, created_at, updated_at')
    .eq('school_year_id', schoolYearId)
    .eq('station_id', stationId);

  if (studentIds && studentIds.length > 0) {
    query = query.in('student_id', studentIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Reports API] Error in getAllStationReports:", error);
    throw error;
  }
  return data || [];
};

export const getYearlyStationReports = async (
  schoolYearId: string,
  studentId: string
): Promise<StationReport[]> => {
  const { data, error } = await supabase
    .from('station_reports')
    .select('id, student_id, school_year_id, station_id, subject_data, subject_skills, global_average, is_global_manual, global_edited_by, global_edited_at, station_comment, created_at, updated_at')
    .eq('school_year_id', schoolYearId)
    .eq('student_id', studentId);

  if (error) {
    console.error("[Reports API] Error in getYearlyStationReports:", error);
    throw error;
  }
  return data || [];
};
