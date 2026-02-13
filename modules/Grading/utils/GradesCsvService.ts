
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
  // 1. Definir encabezados fijos
  const headers = ['Documento', 'Estudiante'];
  const slotMapping: { header: string; id: string }[] = [];

  // 2. Añadir encabezados dinámicos de notas
  station.moments.forEach(m => {
    m.sections.forEach(sec => {
      sec.gradeSlots.forEach(slot => {
        const headerName = `${m.name.split('/')[0].trim()}_${sec.name.trim()}_${slot.name.trim()}`;
        headers.push(headerName);
        slotMapping.push({ header: headerName, id: slot.id });
      });
    });
  });

  headers.push('Habilidades_IDs'); // IDs separados por ;

  // 3. Generar filas de estudiantes
  const rows = students.map(student => {
    const row = [student.document, student.full_name];
    
    // Valores de notas
    slotMapping.forEach(mapping => {
      row.push(getGradeValue(student.id!, mapping.id, subjectId) || '');
    });

    // IDs de habilidades
    const skills = getSkillSelections(student.id!);
    row.push(skills.join(';'));

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Parsea el CSV y devuelve un objeto estructurado para guardado masivo
 */
export const parseGradesCsv = (
  text: string,
  station: Station,
  students: Student[]
) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.trim());
  const dataLines = lines.slice(1);

  const gradeEntries: GradeEntry[] = [];
  const skillSelections: SkillSelection[] = [];

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

  dataLines.forEach(line => {
    const cols = line.split(',').map(c => c.trim());
    const doc = cols[0];
    const student = students.find(s => s.document === doc);

    if (!student || !student.id) return;

    // Procesar Notas
    Object.entries(colToSlotId).forEach(([colIdx, slotId]) => {
      const val = cols[Number(colIdx)];
      if (val !== undefined && val !== '') {
        gradeEntries.push({
          studentId: student.id!,
          slotId: slotId,
          subjectId: '', // Se llenará en el hook
          value: parseFloat(val) || 0
        });
      }
    });

    // Procesar Habilidades
    if (skillsColIdx !== -1 && cols[skillsColIdx]) {
      const ids = cols[skillsColIdx].split(';').filter(id => id.trim());
      ids.forEach(skillId => {
        skillSelections.push({
          studentId: student.id!,
          skillId: skillId.trim(),
          subjectId: '', // Se llenará en el hook
          stationId: station.id
        });
      });
    }
  });

  return { gradeEntries, skillSelections };
};
