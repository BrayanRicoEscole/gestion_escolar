
import { SchoolYear, Station, LearningMoment, Section, GradeSlot, Subject, Area, Lab, Level, AtelierType, Skill } from '../../../types';

const CSV_HEADERS = [
  'Nombre_Año',
  'Nombre_Estacion',
  'Peso_Estacion',
  'Fecha_Inicio',
  'Fecha_Fin',
  'Nombre_Momento',
  'Peso_Momento',
  'Nombre_Seccion',
  'Peso_Seccion',
  'Nombre_Nota',
  'Peso_Nota',
  'Escala_Nota',
  'Nombre_Asignatura',
  'Area_Asignatura',
  'Lab_Asignatura',
  'Cursos_Asignatura',
  'Modalidades_Asignatura',
  'Niveles_Asignatura',
  'Skill_Nivel',
  'Skill_Descripcion'
];

const escapeCsv = (value: string) => {
  if (value == null) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const generateYearTemplateCsv = () => {
  const rows = [
    CSV_HEADERS.join(','),
    // Ejemplo 1: Estructura de Evaluación
    [
      '2027', 'Primer Semestre', '50', '2027-01-15', '2027-06-15',
      'Sowing / Exploración', '25', 'Evidencias de Clase', '40', 'Participación Activa', '100', '1 - 5',
      '', '', '', '', '', '', '', ''
    ].map(escapeCsv).join(','),
    // Ejemplo 2: Configuración de Asignatura y Grupos
    [
      '2027', 'Primer Semestre', '50', '2027-01-15', '2027-06-15',
      '', '', '', '', '', '', '',
      'Lenguaje Creativo', 'ClePe', 'ClePe', 'C1-M;C2-M;D1-C', 'Atelier Mónaco (M);Atelier Casa (C)', 'C;D;E', '', ''
    ].map(escapeCsv).join(','),
    // Ejemplo 3: Banco de Habilidades
    [
      '2027', 'Primer Semestre', '50', '2027-01-15', '2027-06-15',
      '', '', '', '', '', '', '',
      'Lenguaje Creativo', 'ClePe', 'ClePe', '', '', '', 'C', 'Reconoce la estructura de un texto narrativo simple.'
    ].map(escapeCsv).join(',')
  ];
  return rows.join('\n');
};

/**
 * Parsea una línea de CSV respetando las comillas
 */
const parseCsvLine = (line: string): string[] => {
  const parts: string[] = [];
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
  return parts;
};

export const parseYearCsv = (text: string): SchoolYear[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('Nombre_Año'));
  const yearsMap = new Map<string, SchoolYear>();

  lines.forEach(line => {
    // Procesar comas cuidando posibles puntos y comas usados como separadores internos
    const columns = parseCsvLine(line);
    if (columns.length < CSV_HEADERS.length) return;

    const [
      yearName, stName, stWeight, stStart, stEnd,
      moName, moWeight, seName, seWeight, slName, slWeight, slScale,
      subName, subArea, subLab, subCourses, subModalities, subLevels,
      skLevel, skDesc
    ] = columns;

    if (!yearName) return;

    // 1. Obtener o Crear Año
    if (!yearsMap.has(yearName)) {
      yearsMap.set(yearName, { id: crypto.randomUUID(), name: yearName, stations: [] });
    }
    const year = yearsMap.get(yearName)!;

    // 2. Obtener o Crear Estación
    let station = year.stations.find(s => s.name === stName);
    if (!station && stName) {
      station = {
        id: crypto.randomUUID(),
        name: stName,
        weight: Number(stWeight || 0),
        startDate: stStart || '',
        endDate: stEnd || '',
        moments: [],
        subjects: []
      };
      year.stations.push(station);
    }

    if (!station) return;

    // --- RUTA A: Estructura de Evaluación ---
    if (moName) {
      let moment = station.moments.find(m => m.name === moName);
      if (!moment) {
        moment = { id: crypto.randomUUID(), name: moName, weight: Number(moWeight || 0), sections: [] };
        station.moments.push(moment);
      }

      if (seName) {
        let section = moment.sections.find(s => s.name === seName);
        if (!section) {
          section = { id: crypto.randomUUID(), name: seName, weight: Number(seWeight || 0), gradeSlots: [] };
          moment.sections.push(section);
        }

        if (slName) {
          section.gradeSlots.push({
            id: crypto.randomUUID(),
            name: slName,
            weight: Number(slWeight || 0),
            scale: slScale || '1 - 5'
          });
        }
      }
    }

    // --- RUTA B: Catálogo Académico ---
    if (subName) {
      let subject = station.subjects.find(s => s.name === subName);
      if (!subject) {
        subject = {
          id: crypto.randomUUID(),
          name: subName,
          area: subArea as Area || Area.STEAM,
          lab: subLab as Lab || Lab.MEC,
          courses: subCourses ? subCourses.split(';').map(c => c.trim()) : [],
          ateliers: subModalities ? subModalities.split(';').map(m => m.trim() as AtelierType) : [],
          levels: subLevels ? subLevels.split(';').map(l => l.trim() as Level) : [],
          skills: []
        };
        station.subjects.push(subject);
      } else {
        // Si la materia ya existe, podemos enriquecer sus listas si vienen datos nuevos
        if (subCourses) {
          const newCourses = subCourses.split(';').map(c => c.trim());
          subject.courses = Array.from(new Set([...subject.courses, ...newCourses]));
        }
      }

      // Añadir Habilidades a la materia
      if (skLevel && skDesc) {
        const skill: Skill = {
          id: crypto.randomUUID(),
          level: skLevel as Level,
          description: skDesc
        };
        subject.skills = [...(subject.skills || []), skill];
      }
    }
  });

  return Array.from(yearsMap.values());
};
