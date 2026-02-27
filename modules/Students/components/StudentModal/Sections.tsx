import React from 'react';
import { GraduationCap, UserCircle, ShieldCheck, Mail, Phone, CreditCard, Activity } from 'lucide-react';
import { Student } from 'types';
import { DetailSection, DetailItem } from '../DetailSection';

export const AcademicSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<GraduationCap size={18} />} title="Académico" color="text-blue-500">
    <DetailItem label="Nivel Académico" value={student.academic_level} />
    <DetailItem label="Grado" value={student.grade} />
    <DetailItem label="Grupo" value={student.calendario_grupo} />
    <DetailItem label="Atelier" value={student.atelier} />
  </DetailSection>
);

export const PersonalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<UserCircle size={18} />} title="Personal" color="text-purple-500">
    <DetailItem label="Nacimiento" value={student.nacimiento} />
    <DetailItem label="Edad" value={student.edad} />
    <DetailItem label="Género" value={student.genero} />
  </DetailSection>
);

export const InstitutionalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<ShieldCheck size={18} />} title="Institucional" color="text-green-500">
    <DetailItem label="Cuenta Inst." value={student.cuenta_institucional} />
    <DetailItem label="Inicio" value={student.inicio} />
  </DetailSection>
);

export const GuardianMainSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Mail size={18} />} title="Acudiente" color="text-rose-500">
    <DetailItem label="Nombre" value={student.acudiente_academico} />
    <DetailItem label="Teléfono" value={student.telefono_a} />
  </DetailSection>
);

export const GuardianSecondarySection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Phone size={18} />} title="Financiero" color="text-indigo-500">
    <DetailItem label="Responsable" value={student.acudiente_financiero} />
    <DetailItem label="Teléfono" value={student.telefono_financiero} />
  </DetailSection>
);

export const FinancialSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<CreditCard size={18} />} title="Estado" color="text-amber-500">
    <DetailItem label="Paz y Salvo" value={student.paz_y_salvo} />
    <DetailItem label="Contrato" value={student.contrato} />
  </DetailSection>
);

export const HealthSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Activity size={18} />} title="Salud" color="text-cyan-500">
    <DetailItem label="Póliza" value={student.poliza} />
  </DetailSection>
);
