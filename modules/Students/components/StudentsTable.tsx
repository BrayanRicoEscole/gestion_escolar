import React from 'react';
import {
  Loader2,
  MapPin,
  Home,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import { Student } from 'types';

interface Props {
  students: Student[];
  loading?: boolean;
  onSelect: (student: Student) => void;
}

export const StudentsTable: React.FC<Props> = ({
  students,
  loading = false,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-5xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <Th>Seed / Estudiante</Th>
              <Th>Documento ID</Th>
              <Th>Grupo Académico</Th>
              <Th>Ubicación / Modalidad</Th>
              <Th align="center">Estado</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <LoadingRow />
            ) : students.length > 0 ? (
              students.map(student => (
                <StudentRow
                  key={student.document}
                  student={student}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <EmptyRow />
            )}
          </tbody>
        </table>
      </div>

      <Footer count={students.length} />
    </div>
  );
};

/* ------------------ Subcomponentes ------------------ */

const Th = ({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) => (
  <th
    className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-${align}`}
  >
    {children}
  </th>
);

const LoadingRow = () => (
  <tr>
    <td colSpan={6} className="py-20 text-center">
      <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
      <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
        Cargando estudiantes…
      </p>
    </td>
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="py-20 text-center">
      <p className="text-xs font-black uppercase text-slate-300 tracking-widest">
        No se encontraron estudiantes
      </p>
    </td>
  </tr>
);

const StudentRow = ({
  student,
  onSelect,
}: {
  student: Student;
  onSelect: (s: Student) => void;
}) => {
  const isRS = student.modality === 'RS';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      {/* Estudiante */}
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <Avatar student={student} />
          <div>
            <p className="font-black text-slate-800 text-sm">
              {student.full_name}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Seed No. {student.codigo_estudiantil}
            </p>
          </div>
        </div>
      </td>

      {/* Documento */}
      <td className="px-6 py-5 text-xs font-bold text-slate-600">
        {student.document}
      </td>

      {/* Académico */}
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-700">
            {student.academic_level || 'N/A'}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">
            Grado {student.grade || '—'}
          </span>
        </div>
      </td>

      {/* Modalidad */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1
              ${
                isRS
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-orange-50 text-orange-600'
              }`}
          >
            {isRS ? <MapPin size={10} /> : <Home size={10} />}
            {isRS ? 'Sede' : 'Casa'}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {student.atelier || '—'}
          </span>
        </div>
      </td>

      {/* Estado */}
      <td className="px-6 py-5 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase
            ${
              student.estado_actual?.toLowerCase().includes('activo')
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}
        >
          {student.estado_actual || 'Activo'}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton onClick={() => onSelect(student)}>
            <UserCircle size={18} />
          </ActionButton>
         
        </div>
      </td>
    </tr>
  );
};

const Avatar = ({ student }: { student: Student }) => (
  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-black text-sm border border-blue-100 overflow-hidden">
    {student.avatar_url ? (
      <img
        src={student.avatar_url}
        alt={student.full_name}
        className="w-full h-full object-cover"
      />
    ) : (
      student.full_name?.charAt(0)
    )}
  </div>
);

const ActionButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white shadow-sm border border-transparent hover:border-slate-100 transition-all"
  >
    {children}
  </button>
);

const Footer = ({ count }: { count: number }) => (
  <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
    <span className="text-xs font-bold text-slate-400">
      Mostrando {count} estudiantes
    </span>
    <div className="flex gap-2">
      <button disabled className="btn-disabled">Anterior</button>
      <button disabled className="btn-disabled">Siguiente</button>
    </div>
  </div>
);
