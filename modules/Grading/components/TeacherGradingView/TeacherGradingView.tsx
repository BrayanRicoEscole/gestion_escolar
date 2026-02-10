
import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, Search, Calendar, Lock, Unlock, Zap, Info } from 'lucide-react';
import { useGrading } from '../../../../hooks/useGrading';
import { useStudentResults } from './thGradingHooks/useStudentResults';
import { GradingHeader } from './components/GradingHeader';
import { GradingFilters } from './components/GradingFilters';
import { GradesTable } from './components/GradesTable/GradesTable';

const TeacherGradingView: React.FC = () => {
  const grading = useGrading();

  const {
    isLoading = true,
    schoolYear = null,
    currentStation = null,
    filteredStudents = [],
    selectedStationId = '',
    setSelectedStationId = () => {},
    selectedSubjectId = '',
    setSelectedSubjectId = () => {},
    selectedCourse = '',
    setSelectedCourse = () => {},
    selectedAtelier = 'all',
    setSelectedAtelier = () => {},
    selectedModality = 'all',
    setSelectedModality = () => {},
    selectedAcademicLevel = 'all',
    setSelectedAcademicLevel = () => {},
    searchTerm = '',
    setSearchTerm = () => {},
    isSaving = false,
    getGradeValue = () => '',
    getLevelingValue = () => '',
    handleGradeChange = () => {},
    handleLevelingChange = () => {},
    toggleSkillSelection = () => {},
    getSkillSelectionsForStudent = () => []
  } = grading ?? {};

  const [collapsedMoments, setCollapsedMoments] = useState<Set<string>>(new Set());

  const isWithinDateRange = useMemo(() => {
    if (!currentStation?.startDate || !currentStation?.endDate) return true;
    const now = new Date();
    const start = new Date(currentStation.startDate);
    const end = new Date(currentStation.endDate);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  }, [currentStation]);

  const toggleMoment = (momentId: string) => {
    setCollapsedMoments(prev => {
      const next = new Set(prev);
      if (next.has(momentId)) next.delete(momentId);
      else next.add(momentId);
      return next;
    });
  };

  const studentsWithResults = useStudentResults({
    students: filteredStudents,
    station: currentStation,
    subjectId: selectedSubjectId,
    getGradeValue,
    getLevelingValue,
    consolidationFilter: 'all'
  });

  const currentSubjectName =
    currentStation?.subjects?.find(s => s.id === selectedSubjectId)?.name ?? 'Sin materia';

  if (isLoading || !schoolYear || !currentStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accediendo al Libro de Notas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <GradingHeader
          subjectName={currentSubjectName}
          isSaving={isSaving}
          isEditable={isWithinDateRange}
        />
        
        <div className="flex flex-col items-end gap-2 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isWithinDateRange ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
              {isWithinDateRange ? <Unlock size={12} /> : <Lock size={12} />}
              {isWithinDateRange ? 'Registro Habilitado' : 'Registro Bloqueado'}
           </div>
           <div className="flex items-center gap-3 text-slate-400">
              <Calendar size={14} className="text-primary" />
              <span className="text-[11px] font-bold">
                 Vigencia: <span className="text-slate-700">{currentStation.startDate}</span> al <span className="text-slate-700">{currentStation.endDate}</span>
              </span>
           </div>
        </div>
      </div>

      <GradingFilters
        schoolYear={schoolYear}
        station={currentStation}
        selectedStationId={selectedStationId}
        selectedSubjectId={selectedSubjectId}
        selectedCourse={selectedCourse}
        consolidationFilter="all"
        selectedAtelier={selectedAtelier}
        selectedModality={selectedModality}
        selectedAcademicLevel={selectedAcademicLevel}
        searchTerm={searchTerm}
        onStationChange={setSelectedStationId}
        onSubjectChange={setSelectedSubjectId}
        onCourseChange={setSelectedCourse}
        onConsolidationChange={() => {}}
        onAtelierChange={setSelectedAtelier}
        onModalityChange={setSelectedModality}
        onAcademicLevelChange={setSelectedAcademicLevel}
        onSearchChange={setSearchTerm}
      />

      {studentsWithResults.length > 0 ? (
        <GradesTable
          station={currentStation}
          students={studentsWithResults}
          selectedSubjectId={selectedSubjectId}
          selectedCourse={selectedCourse}
          getGradeValue={getGradeValue}
          getLevelingValue={getLevelingValue}
          onGradeChange={handleGradeChange}
          onLevelingChange={handleLevelingChange}
          collapsedMoments={collapsedMoments}
          onToggleMoment={toggleMoment}
          isEditable={isWithinDateRange}
          onToggleSkill={toggleSkillSelection}
          getSkillSelectionsForStudent={getSkillSelectionsForStudent}
        />
      ) : (
        <div className="mt-10 text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
          <Search size={48} className="mx-auto text-slate-100 mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No se encontraron estudiantes con los filtros actuales</p>
        </div>
      )}

      {/* Alerta de Autoguardado */}
      <div className="mt-10 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <Zap className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 group-hover:text-white/10 transition-all duration-700" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-white/5">
             <Info size={32} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black uppercase tracking-tight mb-2">
                Sistema de Autoguardado e Inteligencia Realtime
            </h4>
            <p className="text-sm text-white/60 font-medium leading-relaxed max-w-4xl">
                Toda calificación ingresada se sincroniza **instantáneamente** con el servidor. 
                Si otro docente edita la misma planilla, verás los cambios reflejados sin necesidad de recargar. 
                Revisa los logs de la consola (F12) para ver la telemetría de sincronización en tiempo real.
            </p>
          </div>
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">En Línea</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherGradingView;
