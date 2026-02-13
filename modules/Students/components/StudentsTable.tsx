
import React from 'react';
import {
  Loader2,
  MapPin,
  Home,
  UserCircle,
} from 'lucide-react';
import { Student } from 'types';

interface Props {
  students: Student[];
  loading?: boolean;
  onSelect: (student: Student) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}

export const StudentsTable: React.FC<Props> = ({
  students,
  loading = false,
  onSelect,
  selectedIds,
  onToggleSelect,
  onToggleAll
}) => {
  const allSelected = students.length > 0 && selectedIds.length === students.length;

  return (
    <div className="bg-white rounded-5xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 w-12">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={onToggleAll}
                  className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
              </th>
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
                  key={student.id || student.document}
                  student={student}
                  isSelected={selectedIds.includes(student.id || '')}
                  onToggle={() => onToggleSelect(student.id || '')}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <EmptyRow />
            )}
          </tbody>
        </table>
      </div>

      <Footer count={students.length} selectedCount={selectedIds.length} />
    </div>
  );
};

const Th: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}> = ({
  children,
  align = 'left',
}) => (
  <th
    className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-${align}`}
  >
    {children}
  </th>
);

const LoadingRow: React.FC = () => (
  <tr>
    <td colSpan={7} className="py-20 text-center">
      <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
      <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
        Cargando estudiantes…
      </p>
    </td>
  </tr>
);

const EmptyRow: React.FC = () => (
  <tr>
    <td colSpan={7} className="py-20 text-center">
      <p className="text-xs font-black uppercase text-slate-300 tracking-widest">
        No se encontraron estudiantes
      </p>
    </td>
  </tr>
);

const StudentRow: React.FC<{
  student: Student;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: (s: Student) => void;
}> = ({
  student,
  isSelected,
  onToggle,
  onSelect,
}) => {
  const isRS = student.modality === 'RS';

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}>
      <td className="px-6 py-5">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onToggle}
          className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
        />
      </td>
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

      <td className="px-6 py-5 text-xs font-bold text-slate-600">
        {student.document}
      </td>

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

const Avatar: React.FC<{ student: Student }> = ({ student }) => (
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

const ActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({
  children,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white shadow-sm border border-transparent hover:border-slate-100 transition-all"
  >
    {children}
  </button>
);

const Footer: React.FC<{ count: number; selectedCount: number }> = ({ count, selectedCount }) => (
  <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold text-slate-400">
        Mostrando {count} estudiantes
      </span>
      {selectedCount > 0 && (
        <span className="text-xs font-black text-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-primary/20 shadow-sm">
          {selectedCount} seleccionados
        </span>
      )}
    </div>
    <div className="flex gap-2">
      <button disabled className="px-4 py-2 text-xs font-bold text-slate-300">Anterior</button>
      <button disabled className="px-4 py-2 text-xs font-bold text-slate-300">Siguiente</button>
    </div>
  </div>
);
