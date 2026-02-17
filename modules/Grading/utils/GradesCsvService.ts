import { Station, Student, GradeEntry, SkillSelection } from '../../../types';

/**
 * Genera un CSV con la estructura actual de notas para la materia seleccionada
 */
export const generateGradesTemplateCsv = (
  station: Station,
  students: Student[],
  subjectId: string,
  getGradeValue: (sId: string, gId: string, subId: string) => string,
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

  headers.push('Habilidades_IDs');

  const rows = students.map(student => {
    const row = [student.document, student.full_name];
    slotMapping.forEach(mapping => {
      row.push(getGradeValue(student.id!, mapping.id, subjectId) || '');
    });
    const skills = getSkillSelections(student.id!);
    row.push(skills.join(';'));
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Parsea el CSV devolviendo una estructura plana para validación profunda en el API
 */
export const parseGradesCsv = (
  text: string,
  station: Station
) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.trim());
  const dataLines = lines.slice(1);

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

  const skillsColIdx = headers.indexOf('Habilidades_IDs');

  const rows = dataLines.map(line => {
    const cols = line.split(',').map(c => c.trim());
    const document = cols[0];
    const fullName = cols[1];

    const grades: { slotId: string; value: number }[] = [];
    Object.entries(colToSlotId).forEach(([colIdx, slotId]) => {
      const val = cols[Number(colIdx)];
      if (val !== undefined && val !== '') {
        grades.push({ slotId, value: parseFloat(val) || 0 });
      }
    });

    const skillIds = skillsColIdx !== -1 && cols[skillsColIdx] 
      ? cols[skillsColIdx].split(';').filter(id => id.trim())
      : [];

    return { document, fullName, grades, skillIds };
  });

  return rows;
};