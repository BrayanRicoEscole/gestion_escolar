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
    <DetailItem label="Modalidad" value={student.modality} />
    <DetailItem label="Calendario" value={student.calendario} />
    <DetailItem label="Rama" value={student.rama} />
    <DetailItem label="TL" value={student.tl} />
    <DetailItem label="Periodo" value={student.periodo} />
  </DetailSection>
);

export const PersonalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<UserCircle size={18} />} title="Personal" color="text-purple-500">
    <DetailItem label="Tipo ID" value={student.tipo_id_estudiante} />
    <DetailItem label="Nacimiento" value={student.nacimiento} />
    <DetailItem label="Lugar Nac." value={student.lugar_nacimiento} />
    <DetailItem label="Edad" value={student.edad} />
    <DetailItem label="Género" value={student.genero} />
    <DetailItem label="Fecha Exp." value={student.fecha_expedicion} />
    <DetailItem label="Lugar Exp." value={student.lugar_expedicion} />
  </DetailSection>
);

export const InstitutionalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<ShieldCheck size={18} />} title="Institucional" color="text-green-500">
    <DetailItem label="Cuenta Inst." value={student.cuenta_institucional} />
    <DetailItem label="Código Est." value={student.codigo_estudiantil} />
    <DetailItem label="Colegio" value={student.colegio} />
    <DetailItem label="Programa" value={student.programa} />
    <DetailItem label="Raíces" value={student.programa_raices} />
    <DetailItem label="SIMAT" value={student.categoria_simat} />
    <DetailItem label="Inicio" value={student.inicio} />
    <DetailItem label="Fin" value={student.fin} />
    <DetailItem label="Proceso" value={student.proceso} />
    <DetailItem label="Dossier" value={student.dossier} />
  </DetailSection>
);

export const GuardianMainSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Mail size={18} />} title="Acudiente Académico" color="text-rose-500">
    <DetailItem label="Nombre" value={student.acudiente_academico} />
    <DetailItem label="Cédula" value={student.cedula_a} />
    <DetailItem label="Correo" value={student.correo_a} />
    <DetailItem label="Teléfono" value={student.telefono_a} />
  </DetailSection>
);

export const GuardianSecondarySection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Phone size={18} />} title="Acudiente B" color="text-indigo-500">
    <DetailItem label="Nombre" value={student.acudiente_b} />
    <DetailItem label="Correo" value={student.correo_b} />
    <DetailItem label="Teléfono" value={student.telefono_b} />
  </DetailSection>
);

export const FinancialSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<CreditCard size={18} />} title="Financiero" color="text-amber-500">
    <DetailItem label="Responsable" value={student.acudiente_financiero} />
    <DetailItem label="Cédula" value={student.cedula_financiero} />
    <DetailItem label="Correo" value={student.correo_financiero} />
    <DetailItem label="Teléfono" value={student.telefono_financiero} />
    <DetailItem label="Paz y Salvo" value={student.paz_y_salvo} />
    <DetailItem label="Contrato" value={student.contrato} />
  </DetailSection>
);

export const HealthSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Activity size={18} />} title="Salud y DX" color="text-cyan-500">
    <DetailItem label="RH" value={student.rh} />
    <DetailItem label="Póliza" value={student.poliza} />
    <DetailItem label="Activación" value={student.fecha_activacion_poliza} />
    <DetailItem label="Renovación" value={student.fecha_renovacion_poliza} />
    <DetailItem label="DX1" value={student.dx1} />
    <DetailItem label="DX2" value={student.dx2} />
    <DetailItem label="Cualitativo" value={student.complemento_cualitativo} />
  </DetailSection>
);
