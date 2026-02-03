
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
  id?: string;
  full_name: string;
  document: string;
  avatar_url?: string;
  academic_level?: string; 
  grade?: string;          
  atelier?: string;        
  modality?: string;
  // Campos extendidos del Spreadsheet
  calendario?: string;
  calendario_grupo?: string;
  colegio?: string;
  rama?: string;
  tl?: string;
  contrato?: string;
  periodo?: string;
  cuenta_institucional?: string;
  nacimiento?: string;
  edad?: string;
  rh?: string;
  programa_raices?: string;
  categoria_simat?: string;
  dx1?: string;
  dx2?: string;
  complemento_cualitativo?: string;
  programa?: string;
  estado_actual?: string;
  inicio?: string;
  fin?: string;
  tipo_id_estudiante?: string;
  cedula_a?: string;
  acudiente_academico?: string;
  correo_a?: string;
  telefono_a?: string;
  acudiente_b?: string;
  correo_b?: string;
  telefono_b?: string;
  cedula_financiero?: string;
  acudiente_financiero?: string;
  correo_financiero?: string;
  telefono_financiero?: string;
  lugar_nacimiento?: string;
  fecha_expedicion?: string;
  lugar_expedicion?: string;
  genero?: string;
  proceso?: string;
  dossier?: string;
  paz_y_salvo?: string;
  codigo_estudiantil?: string;
  poliza?: string;
  fecha_activacion_poliza?: string;
  fecha_renovacion_poliza?: string;
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

export interface CommentTemplate {
  id: string;
  schoolYearId: string;
  academicLevel: string;
  fieldKey: string;
  content: string;
}

export type CommentStatus = 'draft' | 'analyzed' | 'improved' | 'approved' | 'rejected';

export interface StudentComment {
  studentId: string;
  stationId: string;
  convivenciaGrade: number | null;
  academicCons: string;
  academicNon: string;
  emotionalSkills: string;
  talents: string;
  socialInteraction: string;
  challenges: string;
  piarDesc: string;
  learningCropDesc: string;
  comentary?: string;
  comentaryStatus?: CommentStatus;
  comentaryQuality?: number;
  aiSuggestion?: string;
}
