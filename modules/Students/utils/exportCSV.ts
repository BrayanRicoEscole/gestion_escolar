
import { Student } from '../../../types';

export const exportStudentsToCSV = (students: Student[]) => {
  if (!students.length) return;

  const headers = [
    'ID', 'Seed', 'Grupo', 'Grado', 'Calendario', 'Calendario grupo', 'Modalidad', 'Atelier',
    'Colegio', 'Rama', 'TL', 'contrato', 'Periodo', 'Cuenta institucional', 'Nacimiento',
    'Edad', 'RH', 'Programa Raices', 'Categoría Simat', 'DX1', 'DX2', 'Complemento Cualitativo',
    'Programa', 'Estado actual', 'Inicio', 'Fin', 'Tipo ID estudiante', 'Cédula A',
    'Acudiente Académico', 'Correo A', 'Teléfono A', 'Acudiente B', 'Correo B', 'Teléfono B',
    'Cédula financiero', 'Acudiente financiero', 'Correo financiero', 'Teléfono financiero',
    'Lugar de nacimiento', 'Fecha de expedición', 'Lugar de expedición', 'Genero', 'Proceso',
    'Dossier', 'Paz y Salvo', 'Código Estudiantil', 'Poliza', 'Fecha activación poliza',
    'Fecha renovación poliza'
  ];

  const rows = students.map(s => [
    s.document || '',
    s.full_name || '',
    s.academic_level || '',
    s.grade || '',
    s.calendario || '',
    s.calendario_grupo || '',
    s.modality || '',
    s.atelier || '',
    s.colegio || '',
    s.rama || '',
    s.tl || '',
    s.contrato || '',
    s.periodo || '',
    s.cuenta_institucional || '',
    s.nacimiento || '',
    s.edad || '',
    s.rh || '',
    s.programa_raices || '',
    s.categoria_simat || '',
    s.dx1 || '',
    s.dx2 || '',
    s.complemento_cualitativo || '',
    s.programa || '',
    s.estado_actual || '',
    s.inicio || '',
    s.fin || '',
    s.tipo_id_estudiante || '',
    s.cedula_a || '',
    s.acudiente_academico || '',
    s.correo_a || '',
    s.telefono_a || '',
    s.acudiente_b || '',
    s.correo_b || '',
    s.telefono_b || '',
    s.cedula_financiero || '',
    s.acudiente_financiero || '',
    s.correo_financiero || '',
    s.telefono_financiero || '',
    s.lugar_nacimiento || '',
    s.fecha_expedicion || '',
    s.lugar_expedicion || '',
    s.genero || '',
    s.proceso || '',
    s.dossier || '',
    s.paz_y_salvo || '',
    s.codigo_estudiantil || '',
    s.poliza || '',
    s.fecha_activacion_poliza || '',
    s.fecha_renovacion_poliza || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
