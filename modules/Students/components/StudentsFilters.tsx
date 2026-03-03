import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Student } from 'types';

interface Filters {
  search: string;
  atelier: string;
  calendario: string;
  grade: string;
  academicLevel: string;
  tl: string;
  showMissingFields: boolean;
}

interface Setters {
  setSearch: (v: string) => void;
  setAtelier: (v: string) => void;
  setCalendario: (v: string) => void;
  setGrade: (v: string) => void;
  setAcademicLevel: (v: string) => void;
  setTl: (v: string) => void;
  setShowMissingFields: (v: boolean) => void;
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
  const ateliers = Array.from(new Set(students.map(s => s.atelier).filter(Boolean))).sort();
  const calendarios = Array.from(new Set(students.map(s => s.calendario).filter(Boolean))).sort();
  const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort();
  const academicLevels = Array.from(new Set(students.map(s => s.academic_level).filter(Boolean))).sort();
  const tls = Array.from(new Set(students.map(s => s.tl).filter(Boolean))).sort();

  return (
    <Card className="mb-8 flex flex-col gap-6" padding="sm">
      <div className="flex flex-wrap items-center gap-6">
        {/* Label */}
        <div className="flex items-center gap-3 border-r pr-6">
          <Filter size={18} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Filtros
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
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
            <option value="all">Atelier: Todos</option>
            {ateliers.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Calendario */}
          <select
            value={filters.calendario}
            onChange={e => setters.setCalendario(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Calendario: Todos</option>
            {calendarios.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Grado */}
          <select
            value={filters.grade}
            onChange={e => setters.setGrade(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Grado: Todos</option>
            {grades.map(g => (
              <option key={g} value={g}>
                Grado {g}
              </option>
            ))}
          </select>

          {/* Nivel */}
          <select
            value={filters.academicLevel}
            onChange={e => setters.setAcademicLevel(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Nivel: Todos</option>
            {academicLevels.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* TL */}
          <select
            value={filters.tl}
            onChange={e => setters.setTl(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">TL: Todos</option>
            {tls.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.showMissingFields}
            onChange={e => setters.setShowMissingFields(e.target.checked)}
            className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
          />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">
            Ver solo con campos incompletos
          </span>
        </label>
      </div>
    </Card>
  );
};
