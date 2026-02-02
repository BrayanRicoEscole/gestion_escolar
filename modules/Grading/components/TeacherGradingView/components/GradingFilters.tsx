
import React, { useMemo } from 'react';
import { Search, Filter, Home, MapPin, Layers } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { SchoolYear, Station } from '../../../../../types';

export type ConsolidationStatus = 'all' | 'consolidated' | 'not_consolidated';

interface GradingFiltersProps {
  schoolYear: SchoolYear;
  station: Station;
  selectedStationId: string;
  selectedSubjectId: string;
  selectedCourse: string;
  consolidationFilter: ConsolidationStatus;
  selectedAtelier: string;
  selectedModality: string;
  selectedAcademicLevel: string;
  searchTerm: string;
  onStationChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onConsolidationChange: (value: ConsolidationStatus) => void;
  onAtelierChange: (value: string) => void;
  onModalityChange: (value: string) => void;
  onAcademicLevelChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export const GradingFilters: React.FC<GradingFiltersProps> = ({
  schoolYear,
  station,
  selectedStationId,
  selectedSubjectId,
  selectedCourse,
  consolidationFilter,
  selectedAtelier,
  selectedModality,
  selectedAcademicLevel,
  searchTerm,
  onStationChange,
  onSubjectChange,
  onCourseChange,
  onConsolidationChange,
  onAtelierChange,
  onModalityChange,
  onAcademicLevelChange,
  onSearchChange
}) => {
  const currentSubject = useMemo(() => 
    station?.subjects?.find(s => s.id === selectedSubjectId)
  , [station, selectedSubjectId]);

  const currentSubjectCourses = currentSubject?.courses || [];

  // Extraer niveles y modalidades únicos permitidos para esta asignatura
  const { availableLevels, availableModalities } = useMemo(() => {
    const levels = new Set<string>();
    const modalities = new Set<string>();
    
    currentSubjectCourses.forEach(course => {
      const [lvl, suffix] = course.split('-');
      levels.add(lvl);
      modalities.add(suffix === 'M' ? 'RS' : 'RC');
    });

    return {
      availableLevels: Array.from(levels).sort(),
      availableModalities: Array.from(modalities)
    };
  }, [currentSubjectCourses]);

  return (
    <div className="space-y-4 mb-8">
      {/* Filtros Principales Académicos */}
      <Card className="flex flex-wrap items-center gap-6" padding="sm">
        <div className="flex items-center gap-4 border-r pr-6">
          <Filter size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Académico
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estación</label>
            <select
              value={selectedStationId}
              onChange={e => onStationChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {schoolYear.stations?.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Materia</label>
            <select
              value={selectedSubjectId}
              onChange={e => onSubjectChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {station.subjects?.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Grupo/Curso</label>
            <select
              value={selectedCourse}
              onChange={e => onCourseChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {currentSubjectCourses.length > 0 ? (
                <>
                  <option value="">Todos los grupos de {currentSubject?.name}</option>
                  {currentSubjectCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </>
              ) : (
                <option value="">Sin cursos</option>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estado Consolidación</label>
            <select
              value={consolidationFilter}
              onChange={e => onConsolidationChange(e.target.value as ConsolidationStatus)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="consolidated">Consolidado (≥ 3.7)</option>
              <option value="not_consolidated">{"No consolidado (< 3.7)"}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Filtros de Segmentación de Estudiantes */}
      <Card className="flex flex-wrap items-center gap-6" padding="sm">
        <div className="flex items-center gap-4 border-r pr-6">
          <Layers size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Segmentación
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
              <MapPin size={10} /> Atelier
            </label>
            <select
              value={selectedAtelier}
              onChange={e => onAtelierChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Todos los Ateliers</option>
              <option value="Mónaco">Mónaco</option>
              <option value="Alhambra">Alhambra</option>
              <option value="Mandalay">Mandalay</option>
              <option value="Casa">Casa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
              <Home size={10} /> Modalidad
            </label>
            <select
              value={selectedModality}
              onChange={e => onModalityChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Todas ({availableModalities.join(', ')})</option>
              {availableModalities.map(m => (
                <option key={m} value={m}>{m === 'RS' ? 'Renfort Sede (RS)' : 'Renfort Casa (RC)'}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Nivel Académico</label>
            <select
              value={selectedAcademicLevel}
              onChange={e => onAcademicLevelChange(e.target.value)}
              className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Todos ({availableLevels.join(', ')})</option>
              {availableLevels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Búsqueda Rápida</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Nombre o ID..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium text-black focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

GradingFilters.displayName = 'GradingFilters';
