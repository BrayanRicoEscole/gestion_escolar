import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../../../../../components/ui/Card';

export type ConsolidationStatus = 'all' | 'consolidated' | 'not_consolidated';

interface GradingFiltersProps {
  schoolYear: { stations?: { id: string; name: string }[] };
  currentStation: { subjects?: { id: string; name: string; courses?: string[] }[] };
  selectedStationId: string;
  onStationChange: (id: string) => void;
  selectedSubjectId: string;
  onSubjectChange: (id: string) => void;
  selectedCourse: string;
  onCourseChange: (course: string) => void;
  consolidationFilter: ConsolidationStatus;
  onConsolidationChange: (value: ConsolidationStatus) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const GradingFilters: React.FC<GradingFiltersProps> = ({
  schoolYear,
  currentStation,
  selectedStationId,
  onStationChange,
  selectedSubjectId,
  onSubjectChange,
  selectedCourse,
  onCourseChange,
  consolidationFilter,
  onConsolidationChange,
  searchTerm,
  onSearchChange
}) => {
  const selectedSubject = currentStation.subjects?.find(s => s.id === selectedSubjectId);

  return (
    <Card className="flex flex-wrap items-center gap-6 mb-8" padding="sm">
      <div className="flex items-center gap-4 border-r pr-6">
        <Filter size={20} className="text-slate-400" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Filtros
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 max-w-5xl">
        <select
          value={selectedStationId}
          onChange={e => onStationChange(e.target.value)}
          className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 text-black"
        >
          {schoolYear.stations?.map(station => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>

        <select
          value={selectedSubjectId}
          onChange={e => onSubjectChange(e.target.value)}
          className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 text-black"
        >
          {currentStation.subjects?.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={e => onCourseChange(e.target.value)}
          className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 text-black"
        >
          {selectedSubject?.courses?.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <select
          value={consolidationFilter}
          onChange={e => onConsolidationChange(e.target.value as ConsolidationStatus)}
          className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 text-black"
        >
          <option value="all">Todos los estados</option>
          <option value="consolidated">Consolidado (≥ 3.7)</option>
          <option value="not_consolidated">{"No consolidado (< 3.7)"}</option>
        </select>
      </div>

      <div className="relative flex-1 min-w-[300px]">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 text-black"
        />
      </div>
    </Card>
  );
};