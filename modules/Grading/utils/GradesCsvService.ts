import { Station, Student, GradeEntry, SkillSelection } from '../../../types';

const escapeCsv = (value: string) => {
  if (value == null) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};
/**
 * Genera un CSV con la estructura actual de notas para la materia seleccionada
 */
export const generateGradesTemplateCsv = (
  station: Station,
  students: Student[],
  subjectId: string,
  getGradeValue: (sId: string, gId: string, subId: string) => string,
  getLevelingValue: (sId: string) => string,
  getSkillSelections: (sId: string) => string[]
) => {
  const headers = ['Documento', 'Estudiante'];
  const slotMapping: { header: string; id: string }[] = [];

  station.moments.forEach(m => {
    
    m.sections.forEach(sec => {
      
      sec.gradeSlots.forEach(slot => {
        const headerName = `${m.name.split('/')[0].trim()}_${sec.name.trim()}_${slot.name.trim()}`;
        headers.push(headerName);
        slotMapping.push({ header: headerName, id: slot.id });
      });
    });
  });

  headers.push('Nota_Nivelacion');
  headers.push('Habilidades');

  const rows = students.map(student => {
    const row = [student.document || '', student.full_name || ''];
    slotMapping.forEach(mapping => {
      row.push(getGradeValue(student.id!, mapping.id, subjectId) || '');
    });
    row.push(getLevelingValue(student.id!) || '');
    const skills = getSkillSelections(student.id!);
    row.push(skills.join('\n'));
    return row.map(escapeCsv).join(',');
  });

  return [headers.map(escapeCsv).join(','), ...rows].join('\n');
};

/**
 * Parsea el CSV devolviendo una estructura plana para validación profunda en el API
 */
export const parseGradesCsv = (
  text: string,
  station: Station
) => {
  const allRows: string[][] = [];
  let currentLine: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      currentLine.push(currentCell.trim());
      if (currentLine.some(c => c !== '')) {
        allRows.push(currentLine);
      }
      currentLine = [];
      currentCell = '';
      if (char === '\r') i++;
    } else {
      currentCell += char;
    }
  }
  
  if (currentCell || currentLine.length > 0) {
    currentLine.push(currentCell.trim());
    if (currentLine.some(c => c !== '')) {
      allRows.push(currentLine);
    }
  }

  if (allRows.length < 2) return null;

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  // Mapear qué columna corresponde a qué Slot ID
  const colToSlotId: Record<number, string> = {};
  headers.forEach((h, idx) => {
    station.moments.forEach(m => {
      m.sections.forEach(sec => {
        sec.gradeSlots.forEach(slot => {
          const expected = `${m.name.split('/')[0].trim()}_${sec.name.trim()}_${slot.name.trim()}`;
          if (h === expected) colToSlotId[idx] = slot.id;
        });
      });
    });
  });

  // Limpiar posibles caracteres invisibles (BOM, etc) de los headers
  const cleanHeaders = headers.map(h => h.replace(/^\uFEFF/, '').toLowerCase().trim());
  
  const skillsColIdx = cleanHeaders.findIndex(h => h === 'habilidades' || h === 'habilidades_ids');
  const levelingColIdx = cleanHeaders.findIndex(h => h === 'nota_nivelacion' || h === 'nivelacion');

  const rows = dataRows.map(cols => {
    const document = cols[0];
    const fullName = cols[1];

    const grades: { slotId: string; value: number }[] = [];
    Object.entries(colToSlotId).forEach(([colIdx, slotId]) => {
      const val = cols[Number(colIdx)];
      if (val !== undefined && val !== '') {
        grades.push({ slotId, value: parseFloat(val) || 0 });
      }
    });

    const levelingValue = levelingColIdx !== -1 && cols[levelingColIdx]
      ? parseFloat(cols[levelingColIdx]) || null
      : null;

    // Soportar descripciones de habilidades separadas por salto de línea o punto y coma
    const skillDescriptions = skillsColIdx !== -1 && cols[skillsColIdx] 
      ? cols[skillsColIdx].split(/\r?\n|\r|;/).map(d => d.trim()).filter(d => d)
      : [];

    return { document, fullName, grades, levelingValue, skillDescriptions };
  });

  return rows;
};
