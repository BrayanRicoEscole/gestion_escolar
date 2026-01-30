import React, { useState } from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';
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
    saveGrades = async () => false
  } = grading ?? {};

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [consolidationFilter, setConsolidationFilter] = useState<ConsolidationStatus>('all');

  const onSave = async () => {
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
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Accediendo al Registro...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500">
      <GradingHeader
        subjectName={currentSubjectName}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onSave={onSave}
      />

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
          getGradeValue={getGradeValue}
          onGradeChange={handleGradeChange}
        />
      ) : (
        <div className="mt-10 text-center py-20 bg-white rounded-5xl border border-dashed border-slate-200">
          <Search size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
            No se encontraron estudiantes con estos filtros
          </p>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
        <AlertCircle className="text-primary shrink-0" size={24} />
        <p className="text-sm text-primary font-bold">
          <span className="uppercase">Importante:</span> Solo se permiten
          calificaciones de <span className="underline">1</span> o{' '}
          <span className="underline">5</span>. El sistema calcula
          automáticamente los promedios ponderados basándose en la
          jerarquía Notas → Secciones → Momentos → Definitiva. Los criterios de evaluación son compartidos para todas las materias.
        </p>
      </div>
    </div>
  );
};

export default TeacherGradingView;