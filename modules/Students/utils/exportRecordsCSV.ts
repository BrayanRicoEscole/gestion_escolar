
import { AcademicRecord } from '../../../types';

export const exportRecordsToCSV = (records: AcademicRecord[]) => {
  if (!records.length) return;

  const headers = [
    'ID Registro', 'ID Estudiante', 'Documento', 'Estudiante', 'ID Año', 'Año Escolar',
    'Grado', 'Nivel Académico', 'Atelier', 'Modalidad', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Observaciones', 'Fecha Creación'
  ];

  const rows = records.map(r => [
    r.id,
    r.student_id,
    r.student_document || '',
    r.student_name || '',
    r.school_year_id,
    r.school_year_name || '',
    r.grade || '',
    r.academic_level || '',
    r.atelier || '',
    r.modality || '',
    r.status || '',
    r.start_date || '',
    r.end_date || '',
    r.observations || '',
    r.created_at || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `registros_academicos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
