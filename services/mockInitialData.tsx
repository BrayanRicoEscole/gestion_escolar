
import { SchoolYear, Student, GradeEntry, Area, Lab, LearningMoment, Subject } from '../types';

// Helper to generate VALID UUIDs for mock data (using only hex chars 0-9, a-f)
const mockUuid = (prefixCode: string, index: number) => {
  // prefixCode should be a 4-char hex string
  const hex = index.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
};

// Association with a fixed mock subject ID for initial data
const SUB1_ID = mockUuid('d001', 1);

export const MOCK_INITIAL_MOMENTS: LearningMoment[] = [
  {
    id: mockUuid('a001', 1),
    name: 'Sowing / Atención y Exploración',
    weight: 25,
    sections: [
      {
        id: mockUuid('b001', 101),
        name: 'Diagnóstico inicial',
        weight: 0,
        gradeSlots: [
          // Fix: Removed subjectId property as it is no longer part of the GradeSlot interface
          { id: mockUuid('c001', 1001), name: 'I Wonder', weight: 0, scale: '1 - 5' },
          // Fix: Removed subjectId property as it is no longer part of the GradeSlot interface
          { id: mockUuid('c001', 1002), name: 'Pruning Inicial', weight: 0, scale: '1 - 5' }
        ]
      },
      {
        id: mockUuid('b001', 102),
        name: 'Learning Crop',
        weight: 30,
        gradeSlots: [
          // Fix: Removed subjectId property as it is no longer part of the GradeSlot interface
          { id: mockUuid('c001', 1003), name: '1er Entrega', weight: 100, scale: '1 - 5' }
        ]
      }
    ]
  },
  {
    id: mockUuid('a001', 2),
    name: 'Growing / Intervención Activa',
    weight: 25,
    sections: [
      {
        id: mockUuid('b001', 201),
        name: 'Trabajo en clase',
        weight: 100,
        gradeSlots: [
          // Fix: Removed subjectId property as it is no longer part of the GradeSlot interface
          { id: mockUuid('c001', 2001), name: 'Participación', weight: 100, scale: '1 - 5' }
        ]
      }
    ]
  }
];

export const MOCK_INITIAL_SUBJECTS: Subject[] = [
  { id: SUB1_ID, name: 'Lenguaje', area: Area.CLEPE, lab: Lab.CLEPE, courses: ['A1-C', 'B2-M'], modalities: [], levels: [] },
  { id: mockUuid('d001', 2), name: 'Matemáticas', area: Area.STEAM, lab: Lab.MEC, courses: ['A1-C', 'A1-M'], modalities: [], levels: [] },
];

export const MOCK_INITIAL_SCHOOL_YEAR: SchoolYear = {
  id: 'd1d81913-5c3e-4550-ad7c-15d9628eea13',
  name: '2026',
  stations: [
    { id: mockUuid('e001', 1), name: 'Spring', weight: 25, startDate: '2026-01-01', endDate: '2026-04-30', moments: MOCK_INITIAL_MOMENTS, subjects: MOCK_INITIAL_SUBJECTS },
    { id: mockUuid('e001', 2), name: 'Summer', weight: 25, startDate: '2026-05-01', endDate: '2026-06-30', moments: MOCK_INITIAL_MOMENTS, subjects: MOCK_INITIAL_SUBJECTS },
  ]
};

export const MOCK_INITIAL_STUDENTS: Student[] = [
  { id: mockUuid('f001', 1), full_name: 'Alejandro Rodríguez', document: '10203040' },
  { id: mockUuid('f001', 2), full_name: 'Beatriz Morales', document: '20304050' },
  { id: mockUuid('f001', 3), full_name: 'Carlos Sánchez', document: '30405060' },
  { id: mockUuid('f001', 4), full_name: 'Daniela Castro', document: '40506070' },
  { id: mockUuid('f001', 5), full_name: 'Esteban Quintero', document: '50607080' },
];
