
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
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N'
}

export interface Skill {
  id: string;
  level: Level;
  description: string;
}

export interface GradeSlot {
  id: string;
  name: string;
  weight: number;
  scale: string;
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
  courses: string[];
  modalities: Modality[];
  levels: Level[];
  skills?: Skill[]; 
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
  academic_level?: string; 
  grade?: string;          
  atelier?: string;        
  modality?: string;       
}

export interface GradeEntry {
  studentId: string;
  slotId: string;
  subjectId: string;
  value: number | null;
}

export interface LevelingGrade {
  studentId: string;
  subjectId: string;
  stationId: string;
  value: number | null;
}

export interface SkillSelection {
  studentId: string;
  subjectId: string;
  stationId: string;
  skillId: string;
}
