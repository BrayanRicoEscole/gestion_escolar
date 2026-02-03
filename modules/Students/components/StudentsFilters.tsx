import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Student } from 'types';

interface Filters {
  search: string;
  atelier: string;
  modality: string;
  grade: string;
}

interface Setters {
  setSearch: (v: string) => void;
  setAtelier: (v: string) => void;
  setModality: (v: string) => void;
  setGrade: (v: string) => void;
}

interface Props {
  filters: Filters;
  setters: Setters;
  students: Student[];
}

export const StudentsFilters: React.FC<Props> = ({
  filters,
  setters,
  students,
}) => {
  const ateliers = ['Mónaco', 'Alhambra', 'Mandalay', 'Casa'];

  const grades = Array.from(
    new Set(students.map(s => s.grade).filter(Boolean))
  ).sort();

  return (
    <Card className="mb-8 flex flex-wrap items-center gap-6" padding="sm">
      {/* Label */}
      <div className="flex items-center gap-3 border-r pr-6">
        <Filter size={18} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Filtros
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
        {/* Buscar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Nombre o ID..."
            value={filters.search}
            onChange={e => setters.setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Atelier */}
        <select
          value={filters.atelier}
          onChange={e => setters.setAtelier(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todos los Ateliers</option>
          {ateliers.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Modalidad */}
        <select
          value={filters.modality}
          onChange={e => setters.setModality(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todas las Modalidades</option>
          <option value="RS">Renfort Sede (RS)</option>
          <option value="RC">Renfort Casa (RC)</option>
        </select>

        {/* Grado */}
        <select
          value={filters.grade}
          onChange={e => setters.setGrade(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todos los Grados</option>
          {grades.map(g => (
            <option key={g} value={g}>
              Grado {g}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};
