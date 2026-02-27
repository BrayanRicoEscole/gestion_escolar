import { useState } from 'react';
import { Student } from '../../../types';
import { getRetiredStudents, syncStudentsFromSpreadsheet } from '../../../services/api';

export const useRetiredStudentsManagement = (onRefresh: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const exportRetiredToCsv = (students: Student[]) => {
    if (students.length === 0) return;

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
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estudiantes_retirados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImportTemplate = () => {
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
    
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_importar_estudiantes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importRetiredFromCsv = async (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = [];
          let current = '';
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              if (inQuotes && line[j + 1] === '"') {
                current += '"';
                j++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              parts.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          parts.push(current.trim());

          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = parts[index] || '';
          });
          data.push(row);
        }

        const result = await syncStudentsFromSpreadsheet(data);
        alert(`Importación completada:\n- Éxitos: ${result.success}\n- Errores: ${result.errors}\n- Omitidos (ya existen): ${result.skipped}`);
        onRefresh();
      } catch (error) {
        console.error("Error importing CSV:", error);
        alert("Error al procesar el archivo CSV.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  return {
    isProcessing,
    exportRetiredToCsv,
    importRetiredFromCsv,
    downloadImportTemplate
  };
};
