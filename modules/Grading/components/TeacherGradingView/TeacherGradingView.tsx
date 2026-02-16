import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, Search, Calendar, Lock, Unlock, Zap, Info, FileDown, FileUp, ShieldCheck, GraduationCap, ShieldAlert } from 'lucide-react';
import { useGrading } from '../../../../hooks/useGrading';
import { useStudentResults } from './thGradingHooks/useStudentResults';
import { GradingHeader } from './components/GradingHeader';
import { GradingFilters } from './components/GradingFilters';
import { GradesTable } from './components/GradesTable/GradesTable';
import { generateGradesTemplateCsv, parseGradesCsv } from '../../utils/GradesCsvService';

const TeacherGradingView: React.FC<{ userRole?: string }> = ({ userRole = 'grower' }) => {
  console.log(`[DEBUG:GradingView] Renderizado con Rol: ${userRole}`);
  
  const grading = useGrading({ realtime: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === 'support';

  const {
    isLoading = true,
    allYears = [],
    selectedYearId = '',
    setSelectedYearId = () => {},
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
    getSkillSelectionsForStudent = () => [],
    bulkImportGradesAndSkills
  } = grading ?? {};

  const [collapsedMoments, setCollapsedMoments] = useState<Set<string>>(new Set());

  const isWithinDateRange = useMemo(() => {
    if (!currentStation?.startDate || !currentStation?.endDate) return true;
    const now = new Date();
    const start = new Date(currentStation.startDate);
    const end = new Date(currentStation.endDate);
    end.setHours(23, 59, 59, 999);
    const active = now >= start && now <= end;
    console.log(`[DEBUG:GradingView] Estación: ${currentStation.name}. Vigente: ${active}`);
    return active;
  }, [currentStation]);

  const isEditable = useMemo(() => {
    if (isAdmin) {
      console.log("[DEBUG:GradingView] 🔓 Permiso Administrativo Concedido (Bypass Fechas)");
      return true;
    }
    return isWithinDateRange;
  }, [isAdmin, isWithinDateRange]);

  useEffect(() => {
    if (schoolYear) {
      console.log(`[DEBUG:GradingView] Año Cargado: ${schoolYear.name}. Estaciones: ${schoolYear.stations.length}`);
    }
  }, [schoolYear]);

  const toggleMoment = (momentId: string) => {
    setCollapsedMoments(prev => {
      const next = new Set(prev);
      if (next.has(momentId)) next.delete(momentId);
      else next.add(momentId);
      return next;
    });
  };

  const handleDownloadCsv = () => {
    if (!currentStation || !selectedSubjectId) return;
    const csv = generateGradesTemplateCsv(
      currentStation, 
      filteredStudents, 
      selectedSubjectId, 
      getGradeValue, 
      getSkillSelectionsForStudent
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Calificaciones_${currentStation.name}_${selectedSubjectId}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentStation) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseGradesCsv(text, currentStation, filteredStudents);
        if (data) {
          const success = await bulkImportGradesAndSkills(data);
          if (success) alert("Importación completada con éxito.");
        }
      } catch (err) {
        alert("Error al procesar el archivo CSV.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 text-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accediendo al Libro de Notas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <GradingHeader
          subjectName={currentSubjectName}
          isSaving={isSaving}
          isEditable={isEditable}
        />
        
        <div className="flex flex-col items-end gap-3">
           <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl shadow-xl border border-white/10">
              <button 
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <FileDown size={14} className="text-primary" /> Plantilla
              </button>
              {isAdmin && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary-hover shadow-lg"
                  >
                    <FileUp size={14} /> Importar CSV
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImportCsv} accept=".csv" className="hidden" />
                </>
              )}
           </div>

           <div className="flex flex-col items-end gap-2 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEditable ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                  {isEditable ? <Unlock size={12} /> : <Lock size={12} />}
                  {isEditable ? 'Registro Habilitado' : 'Registro Bloqueado'}
                  {isAdmin && !isWithinDateRange && ' (Bypass Admin)'}
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-[11px] font-bold">
                    Vigencia: <span className="text-slate-700">{currentStation.startDate}</span> al <span className="text-slate-700">{currentStation.endDate}</span>
                  </span>
              </div>
           </div>
        </div>
      </div>

      <GradingFilters
        allYears={allYears}
        selectedYearId={selectedYearId}
        onYearChange={setSelectedYearId}
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
          isEditable={isEditable}
          onToggleSkill={toggleSkillSelection}
          getSkillSelectionsForStudent={getSkillSelectionsForStudent}
        />
      ) : (
        <div className="mt-10 text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
            <GraduationCap size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Sin estudiantes vinculados</h3>
          <p className="text-slate-400 text-sm max-w-md mt-2 font-medium">
            No se encontraron estudiantes registrados para el año <strong>{schoolYear.name}</strong>. 
            Asegúrate de haber realizado el proceso de <strong>Matrícula Global</strong> en el módulo de Estudiantes Activos.
          </p>
        </div>
      )}

      {isAdmin && !isWithinDateRange && (
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4">
           <ShieldAlert className="text-amber-600 shrink-0" size={24} />
           <div>
              <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight">Acceso Administrativo Detectado</h4>
              <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
                La fecha de esta estación ha expirado, pero tu rol de **Support** te permite realizar modificaciones fuera de rango. 
                Utiliza esta facultad con precaución para no alterar reportes ya emitidos.
              </p>
           </div>
        </div>
      )}

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
                toda calificación ingresada se sincroniza **instantáneamente** con el servidor. 
                Si otro Grower edita la misma planilla, verás los cambios reflejados sin necesidad de recargar. 
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