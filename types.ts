export enum Area {
  STEAM = 'Steam',
  CLEPE = 'ClePe',
  ONDA = 'Onda',
  MEC = 'MEC',
  CONVIVENCIA = 'Convivencia'
}

export enum Lab {
  CLEPE = 'ClePe',
  ONDA = 'Onda',
  MEC = 'MEC'
}

export enum Modality {
  RC = 'Renfort En Casa (RC)',
  RS = 'Renfort En Sede (RS)'
}

export enum Level {
  PETINE = 'Petiné (Jardín)',
  ELEMENTARY = 'Elementary',
  MIDDLE = 'Middle',
  HIGHSCHOOL = 'Highschool'
}

export interface GradeSlot {
  id: string;
  name: string;
  weight: number;
  scale: string; // Fixed to "1-5"
  // subjectId removed as slots are now global across all subjects
}

export interface Section {
  id: string;
  name: string;
  weight: number;
  gradeSlots: GradeSlot[];
}

export interface LearningMoment {
  id: string;
  name: string;
  weight: number;
  sections: Section[];
}

export interface Subject {
  id: string;
  name: string;
  area: Area;
  lab: Lab;
  courses: string[]; // Codes like "N1-C", "M5-M"
  modalities: Modality[];
  levels: Level[];
}

export interface Station {
  id: string;
  name: string;
  weight: number;
  startDate: string;
  endDate: string;
  moments: LearningMoment[];
  subjects: Subject[];
}

export interface SchoolYear {
  id: string;
  name: string;
  stations: Station[];
}

export interface Student {
  id: string;
  full_name: string;
  document: string;
  avatar?: string;
}

export interface GradeEntry {
  studentId: string;
  slotId: string;
  subjectId: string; // Grades themselves are still subject-specific
  value: number | null;
}