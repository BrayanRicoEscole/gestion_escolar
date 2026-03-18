import { supabase } from './client';
import { Student } from '../../types';

export interface DashboardData {
  students: Student[];
  academicRecords: { 
    student_id: string; 
    year_name: string;
    end_date: string | null;
    final_report_sent: boolean;
  }[];
  availableYears: string[];
  availableModalities: string[];
  availableCourses: string[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  console.log("[DEBUG:Dashboard] 📊 Solicitando datos para el dashboard...");
  
  // 1. Fetch all students
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('*');

  if (studentError) {
    console.error("[DEBUG:Dashboard] ❌ Error recuperando estudiantes:", studentError);
    throw studentError;
  }

  // 2. Fetch academic records to map students to years
  const { data: records, error: recordsError } = await supabase
    .from('student_academic_records')
    .select('student_id, end_date, final_report_sent, school_years(name)');

  if (recordsError) {
    console.error("[DEBUG:Dashboard] ❌ Error recuperando registros académicos:", recordsError);
    throw recordsError;
  }

  const academicRecords = (records || []).map((r: any) => ({
    student_id: r.student_id,
    year_name: r.school_years?.name || 'N/A',
    end_date: r.end_date,
    final_report_sent: !!r.final_report_sent
  }));

  // 3. Extract available filter values
  const availableYears = Array.from(new Set(academicRecords.map(r => r.year_name))).sort().reverse();
  const availableModalities = Array.from(new Set(students?.map(s => s.modality).filter(Boolean) as string[])).sort();
  const availableCourses = Array.from(new Set(students?.map(s => s.grade).filter(Boolean) as string[])).sort();

  return {
    students: students || [],
    academicRecords,
    availableYears,
    availableModalities,
    availableCourses
  };
};
