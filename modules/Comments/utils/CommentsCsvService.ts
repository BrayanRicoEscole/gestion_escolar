
import { Station, Student, StudentComment } from '../../../types';

export const generateCommentsTemplateCsv = (
  station: Station,
  students: Student[],
  getCommentValue: (studentId: string, field: keyof StudentComment) => string
) => {
  const headers = [
    'Documento',
    'Estudiante',
    'Convivencia',
    'Acad_Consolidadas',
    'Acad_No_Consolidadas',
    'Emo_Habilidades',
    'Emo_Talentos',
    'Soc_Interaccion',
    'Soc_Desafios',
    'PIAR',
    'Learning_Crop',
    'Comentario_Final'
  ];

  const rows = students.map(s => [
    s.document,
    s.full_name,
    getCommentValue(s.id || '', 'convivenciaGrade') || '',
    getCommentValue(s.id || '', 'academicCons') || '',
    getCommentValue(s.id || '', 'academicNon') || '',
    getCommentValue(s.id || '', 'emotionalSkills') || '',
    getCommentValue(s.id || '', 'talents') || '',
    getCommentValue(s.id || '', 'socialInteraction') || '',
    getCommentValue(s.id || '', 'challenges') || '',
    getCommentValue(s.id || '', 'piarDesc') || '',
    getCommentValue(s.id || '', 'learning_crop_desc') || '',
    getCommentValue(s.id || '', 'comentary') || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const parseCommentsCsv = (text: string) => {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows = lines.slice(1).filter(l => l.trim());

  return rows.map(line => {
    // Basic CSV parser that handles quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = values[i];
    });

    return {
      document: row['Documento'],
      convivenciaGrade: row['Convivencia'],
      academicCons: row['Acad_Consolidadas'],
      academicNon: row['Acad_No_Consolidadas'],
      emotionalSkills: row['Emo_Habilidades'],
      talents: row['Emo_Talentos'],
      socialInteraction: row['Soc_Interaccion'],
      challenges: row['Soc_Desafios'],
      piarDesc: row['PIAR'],
      learning_crop_desc: row['Learning_Crop'],
      comentary: row['Comentario_Final']
    };
  });
};
