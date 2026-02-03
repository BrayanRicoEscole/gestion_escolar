import React from 'react';
import {
  X,
  GraduationCap,
  UserCircle,
  ShieldCheck,
  Mail,
  Phone,
  CreditCard,
  Activity,
  Briefcase,
} from 'lucide-react';
import { Student } from 'types';
import { Button } from '../../../components/ui/Button';
import { DetailSection, DetailItem } from './DetailSection'

/* ===================== Types ===================== */

interface Props {
  student: Student;
  onClose: () => void;
}

/* ===================== Component ===================== */

export const StudentModal: React.FC<Props> = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Header */}
        <Header student={student} onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AcademicSection student={student} />
            <PersonalSection student={student} />
            <InstitutionalSection student={student} />
            <GuardianMainSection student={student} />
            <GuardianSecondarySection student={student} />
            <FinancialSection student={student} />
            <HealthSection student={student} />
          </div>
        </div>

        {/* Footer */}
        <Footer onClose={onClose} />
      </div>
    </div>
  );
};

/* ===================== Header ===================== */

const Header = ({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) => (
  <div className="p-8 bg-primary text-white flex items-center justify-between shrink-0">
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-black border border-white/5">
        {student.full_name?.charAt(0)}
      </div>
      <div>
        <h2 className="text-2xl font-black tracking-tight">
          {student.full_name}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            ID: {student.document}
          </span>
          <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black uppercase">
            {student.estado_actual}
          </span>
        </div>
      </div>
    </div>

    <button
      onClick={onClose}
      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
    >
      <X size={24} />
    </button>
  </div>
);

/* ===================== Sections ===================== */

const AcademicSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<GraduationCap size={18} />}
    title="Académico"
    color="text-blue-500"
  >
    <DetailItem label="Nivel Académico" value={student.academic_level} />
    <DetailItem label="Grado" value={student.grade} />
    <DetailItem label="Grupo" value={student.calendario_grupo} />
    <DetailItem label="Calendario" value={student.calendario} />
    <DetailItem label="Atelier" value={student.atelier} />
    <DetailItem label="Modalidad" value={student.modality} />
    <DetailItem label="Colegio" value={student.colegio} />
    <DetailItem label="Rama" value={student.rama} />
    <DetailItem label="TL" value={student.tl} />
    <DetailItem label="Código Estudiantil" value={student.codigo_estudiantil} />
    <DetailItem label="Programa" value={student.programa} />
    <DetailItem label="Prog. Raíces" value={student.programa_raices} />
  </DetailSection>
);

const PersonalSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<UserCircle size={18} />}
    title="Personal"
    color="text-purple-500"
  >
    <DetailItem label="Tipo ID" value={student.tipo_id_estudiante} />
    <DetailItem label="Nacimiento" value={student.nacimiento} />
    <DetailItem label="Edad" value={student.edad} />
    <DetailItem label="Género" value={student.genero} />
    <DetailItem label="RH" value={student.rh} />
    <DetailItem label="Lugar Nac." value={student.lugar_nacimiento} />
    <DetailItem label="Exp. Doc" value={student.fecha_expedicion} />
    <DetailItem label="Lugar Exp." value={student.lugar_expedicion} />
  </DetailSection>
);

const InstitutionalSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<ShieldCheck size={18} />}
    title="Institucional"
    color="text-green-500"
  >
    <DetailItem label="Cuenta Inst." value={student.cuenta_institucional} />
    <DetailItem label="Periodo" value={student.periodo} />
    <DetailItem label="Cat. SIMAT" value={student.categoria_simat} />
    <DetailItem label="DX1" value={student.dx1} />
    <DetailItem label="DX2" value={student.dx2} />
    <DetailItem label="Inicio" value={student.inicio} />
    <DetailItem label="Fin" value={student.fin} />
    <DetailItem label="Proceso" value={student.proceso} />
    <DetailItem label="Dossier" value={student.dossier} />
  </DetailSection>
);

const GuardianMainSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<Mail size={18} />}
    title="Acudiente Principal"
    color="text-rose-500"
  >
    <DetailItem label="Nombre" value={student.acudiente_academico} />
    <DetailItem label="Cédula" value={student.cedula_a} />
    <DetailItem label="Correo" value={student.correo_a} />
    <DetailItem label="Teléfono" value={student.telefono_a} />
  </DetailSection>
);

const GuardianSecondarySection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<Phone size={18} />}
    title="Acudiente Secundario"
    color="text-indigo-500"
  >
    <DetailItem label="Nombre" value={student.acudiente_b} />
    <DetailItem label="Correo" value={student.correo_b} />
    <DetailItem label="Teléfono" value={student.telefono_b} />
  </DetailSection>
);

const FinancialSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<CreditCard size={18} />}
    title="Financiero"
    color="text-amber-500"
  >
    <DetailItem label="Responsable" value={student.acudiente_financiero} />
    <DetailItem label="ID Financiero" value={student.cedula_financiero} />
    <DetailItem label="Correo" value={student.correo_financiero} />
    <DetailItem label="Teléfono" value={student.telefono_financiero} />
    <DetailItem label="Paz y Salvo" value={student.paz_y_salvo} />
    <DetailItem label="Contrato" value={student.contrato} />
  </DetailSection>
);

const HealthSection = ({ student }: { student: Student }) => (
  <DetailSection
    icon={<Activity size={18} />}
    title="Salud & Seguros"
    color="text-cyan-500"
  >
    <DetailItem label="Póliza" value={student.poliza} />
    <DetailItem label="Activación" value={student.fecha_activacion_poliza} />
    <DetailItem label="Renovación" value={student.fecha_renovacion_poliza} />

    <div className="col-span-2 mt-4">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
        Cualitativo
      </label>
      <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
        {student.complemento_cualitativo ||
          'Sin observaciones cualitativas adicionales.'}
      </p>
    </div>
  </DetailSection>
);

/* ===================== Footer ===================== */

const Footer = ({ onClose }: { onClose: () => void }) => (
  <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
    <Button variant="ghost" onClick={onClose}>
      Cerrar
    </Button>
    <Button >Aceptar</Button>
  </div>
);
