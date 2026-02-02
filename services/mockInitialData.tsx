import { SchoolYear, Student, GradeEntry, Area, Lab, LearningMoment, Subject } from '../types';

const mockUuid = (prefixCode: string, index: number) => {
  const hex = index.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
};

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
          { id: mockUuid('c001', 1001), name: 'I Wonder', weight: 0, scale: '1 - 5' },
          { id: mockUuid('c001', 1002), name: 'Pruning Inicial', weight: 0, scale: '1 - 5' }
        ]
      },
      {
        id: mockUuid('b001', 102),
        name: 'Learning Crop',
        weight: 30,
        gradeSlots: [
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
          { id: mockUuid('c001', 2001), name: 'Participación', weight: 100, scale: '1 - 5' }
        ]
      }
    ]
  }
];

export const MOCK_INITIAL_SUBJECTS: Subject[] = [
  { id: SUB1_ID, name: 'Lenguaje', area: Area.CLEPE, lab: Lab.CLEPE, courses: ['C1-C', 'D2-M'], modalities: [], levels: [] },
  { id: mockUuid('d001', 2), name: 'Matemáticas', area: Area.STEAM, lab: Lab.MEC, courses: ['C1-C', 'C1-M'], modalities: [], levels: [] },
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
  { id: 'ea071330-375f-4c26-bdc0-697596480e2f', full_name: 'Alejandro Rodríguez', document: '10203040', academic_level: 'C1', grade: '1', atelier: 'Mónaco', modality: 'RS' },
  { id: '390ce1c8-9b6d-457d-8562-c72f9f94a758', full_name: 'Beatriz Morales', document: '20304050', academic_level: 'C1', grade: '1', atelier: 'Alhambra', modality: 'RS' },
  { id: '7ba440be-271d-47ed-915b-c6a4b43bb400', full_name: 'Carlos Sánchez', document: '30405060', academic_level: 'C2', grade: '2', atelier: 'Mandalay', modality: 'RS' },
  { id: '53cf514a-dc50-48bc-a86e-86a67ec86ac2', full_name: 'Daniela Castro', document: '40506070', academic_level: 'D1', grade: '3', atelier: 'Casa', modality: 'RC' },
  { id: '22732320-8b10-4be8-9648-e5a5f09aec32', full_name: 'Esteban Quintero', document: '50607080', academic_level: 'D2', grade: '4', atelier: 'Mónaco', modality: 'RS' },
];