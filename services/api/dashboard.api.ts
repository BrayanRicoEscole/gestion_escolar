
import { supabase } from './client';

export interface DashboardStats {
  totalActive: number;
  totalRetired: number;
  pazYSalvoCount: number;
  byModality: { label: string; count: number; percentage: number }[];
  byGrade: { label: string; count: number }[];
  byAtelier: { label: string; count: number }[];
  byLevel: { label: string; count: number }[];
  withdrawalReasons: { label: string; count: number }[];
  enrollmentByYear: { yearName: string; count: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 1. Obtener todos los estudiantes para agregación local (más eficiente para volumen escolar medio)
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('*');

  if (studentError) throw studentError;

  const total = students?.length || 0;
  const active = students?.filter(s => s.estado_actual?.toLowerCase().includes('activo')) || [];
  const retired = students?.filter(s => !s.estado_actual?.toLowerCase().includes('activo')) || [];
  
  // Agregación por Modalidad
  const modalityCounts = active.reduce((acc: any, s) => {
    const mod = s.modality === 'RS' ? 'Renfort Sede' : 'Renfort Casa';
    acc[mod] = (acc[mod] || 0) + 1;
    return acc;
  }, {});

  // Agregación por Grado
  const gradeCounts = active.reduce((acc: any, s) => {
    const g = s.grade || 'Sin Grado';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  // Agregación por Atelier
  const atelierCounts = active.reduce((acc: any, s) => {
    const a = s.atelier || 'Por Asignar';
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});

  // Agregación Motivos de Retiro
  const retireCounts = retired.reduce((acc: any, s) => {
    const reason = s.estado_actual || 'Otro';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  // Historial por Año (desde registros académicos)
  const { data: yearStats } = await supabase
    .from('student_academic_records')
    .select('school_years(name)');
    
  const yearCounts = (yearStats || []).reduce((acc: any, curr: any) => {
    const name = curr.school_years?.name || 'N/A';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return {
    totalActive: active.length,
    totalRetired: retired.length,
    pazYSalvoCount: active.filter(s => s.paz_y_salvo?.toLowerCase().includes('si') || s.paz_y_salvo?.toLowerCase().includes('ok')).length,
    byModality: Object.entries(modalityCounts).map(([label, count]: [string, any]) => ({
      label,
      count,
      percentage: Math.round((count / active.length) * 100)
    })),
    byGrade: Object.entries(gradeCounts)
      .map(([label, count]: [string, any]) => ({ label: `Grado ${label}`, count }))
      .sort((a, b) => b.count - a.count),
    byAtelier: Object.entries(atelierCounts).map(([label, count]: [string, any]) => ({ label, count })),
    byLevel: [], // Implementar si es necesario
    withdrawalReasons: Object.entries(retireCounts).map(([label, count]: [string, any]) => ({ label, count })),
    enrollmentByYear: Object.entries(yearCounts)
      .map(([yearName, count]: [string, any]) => ({ yearName, count }))
      .sort((a, b) => b.yearName.localeCompare(a.yearName))
  };
};
