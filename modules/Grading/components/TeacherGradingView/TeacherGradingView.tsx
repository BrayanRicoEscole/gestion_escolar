import React, { useState, useMemo } from 'react';
import { Loader2, AlertCircle, Search, Calendar, Lock, Unlock } from 'lucide-react';
import { useGrading } from '../../../../hooks/useGrading';
import { useStudentResults } from './thGradingHooks/useStudentResults';
import { GradingHeader } from './components/GradingHeader';
import { GradingFilters } from './components/GradingFilters';
import { GradesTable } from './components/GradesTable/GradesTable';

type ConsolidationStatus = 'all' | 'consolidated' | 'not_consolidated';

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
    searchTerm = '',
    setSearchTerm = () => {},
    isSaving = false,
    getGradeValue = () => '',
    handleGradeChange = () => {},
    saveGrades = async () => false,
    toggleSkillSelection = () => {},
    getSkillSelectionsForStudent = () => []
  } = grading ?? {};

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [consolidationFilter, setConsolidationFilter] = useState<ConsolidationStatus>('all');
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

  const onSave = async () => {
    if (!isWithinDateRange) return;
    const success = await saveGrades();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const studentsWithResults = useStudentResults({
    students: filteredStudents,
    station: currentStation,
    subjectId: selectedSubjectId,
    getGradeValue,
    consolidationFilter
  });

  const currentSubjectName =
    currentStation?.subjects?.find(s => s.id === selectedSubjectId)?.name ?? 'Sin materia';

  if (isLoading || !schoolYear || !currentStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accediendo al Registro...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <GradingHeader
          subjectName={currentSubjectName}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          onSave={onSave}
          isEditable={isWithinDateRange}
        />
        <div className="flex flex-col items-end gap-2 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isWithinDateRange ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
              {isWithinDateRange ? <Unlock size={12} /> : <Lock size={12} />}
              {isWithinDateRange ? 'Registro Abierto' : 'Registro Bloqueado'}
           </div>
           <div className="flex items-center gap-3 text-slate-400">
              <Calendar size={14} className="text-primary" />
              <span className="text-xs font-bold">
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
        consolidationFilter={consolidationFilter}
        searchTerm={searchTerm}
        onStationChange={setSelectedStationId}
        onSubjectChange={setSelectedSubjectId}
        onCourseChange={setSelectedCourse}
        onConsolidationChange={setConsolidationFilter}
        onSearchChange={setSearchTerm}
      />

      {studentsWithResults.length > 0 ? (
        <GradesTable
          station={currentStation}
          students={studentsWithResults}
          selectedSubjectId={selectedSubjectId}
          selectedCourse={selectedCourse}
          getGradeValue={getGradeValue}
          onGradeChange={handleGradeChange}
          collapsedMoments={collapsedMoments}
          onToggleMoment={toggleMoment}
          isEditable={isWithinDateRange}
          onToggleSkill={toggleSkillSelection}
          getSkillSelectionsForStudent={getSkillSelectionsForStudent}
        />
      ) : (
        <div className="mt-10 text-center py-20 bg-white rounded-5xl border border-dashed border-slate-200">
          <Search size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No se encontraron estudiantes</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
        <AlertCircle className="text-primary shrink-0" size={24} />
        <p className="text-sm text-primary font-bold">
          <span className="uppercase">Importante:</span> Solo se permiten calificaciones de 1 o 5.
        </p>
      </div>
    </div>
  );
};

export default TeacherGradingView;