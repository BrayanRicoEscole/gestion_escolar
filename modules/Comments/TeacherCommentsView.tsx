
import React, { useState, useRef } from 'react';
import {
  Loader2, Lock, Unlock, BrainCircuit, Heart, Users,
  UserCircle,  Sprout, FileDown, FileUp, CheckCircle2, X
} from 'lucide-react';
import { useGrading } from '../../hooks/useGrading';
import { useAuth } from '../../context/AuthContext';
import { StudentComment } from '../../types';
import { GradingHeader } from '../Grading/components/TeacherGradingView/components/GradingHeader';
import { GradingFilters } from '../Grading/components/TeacherGradingView/components/GradingFilters';

import { StudentSidebar } from './components/StudentSidebar';
import { DimensionBlock } from './components/DimensionBlock';
import { CommentSection } from './components/CommentSection';

import { useTeacherComments } from './hooks/useTeacherComments';
import { useDateLock } from './hooks/useDateLock';
import { useMentorAI } from './hooks/useMentorAI';
import { generateCommentsTemplateCsv, parseCommentsCsv } from './utils/CommentsCsvService';

const TeacherCommentsView: React.FC<{ userRole?: string }> = ({ userRole = 'grower' }) => {
  const { profile } = useAuth();
  console.log('DEBUG: TeacherCommentsView - profile:', { id: profile?.id, role: profile?.role });

  // Optimizamos: NO activar realtime de notas y desactivamos el filtro de materia
  const grading = useGrading({ 
    realtime: false, 
    subjectFilter: false,
    userId: profile?.id,
    role: profile?.role
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const isAdmin = userRole === 'support';

  const {
    isLoading = true,
    allYears = [],
    selectedYearId = '',
    setSelectedYearId = () => {},
    schoolYear,
    currentStation,
    filteredStudents = [],
    selectedStationId,
    setSelectedStationId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedCourse,
    setSelectedCourse,
    selectedAtelier,
    setSelectedAtelier,
    selectedAtelierType,
    setSelectedAtelierType,
    selectedAcademicLevel,
    setSelectedAcademicLevel,
    selectedLevelGroup,
    setSelectedLevelGroup,
    visibleGroups = [],
    visibleAteliers = [],
    filteredSubjects = [],
    searchTerm,
    setSearchTerm,
  } = grading ?? {};

  React.useEffect(() => {
    if (!isLoading) {
      console.log('DEBUG: TeacherCommentsView - grading state:', {
        selectedYearId,
        selectedStationId,
        selectedLevelGroup,
        selectedAtelier,
        visibleGroupsCount: visibleGroups.length,
        visibleAteliersCount: visibleAteliers.length,
        filteredStudentsCount: filteredStudents.length
      });
    }
  }, [isLoading, selectedYearId, selectedStationId, selectedLevelGroup, selectedAtelier, visibleGroups, visibleAteliers, filteredStudents]);

  const isLockedByDate = useDateLock(currentStation);
  const isEditable = !isLockedByDate || isAdmin;
  const { analyze, isAnalyzing } = useMentorAI();

  const {
    templates,
    comments,
    selectedStudentId,
    setSelectedStudentId,
    currentComment,
    updateField,
    bulkImport,
  } = useTeacherComments({
    schoolYear,
    stationId: selectedStationId,
    students: filteredStudents,
  });

  const handleDownloadTemplate = () => {
    if (!currentStation) return;
    
    const getCommentValue = (studentId: string, field: keyof StudentComment) => {
      const comment = comments.find(c => c.studentId === studentId);
      return comment ? String(comment[field] || '') : '';
    };

    const csv = generateCommentsTemplateCsv(currentStation, filteredStudents, getCommentValue);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Plantilla_Comentarios_${currentStation.name}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCommentsCsv(text);
        if (rows) {
          const result = await bulkImport(rows);
          setImportResult(result);
        }
      } catch (err) {
        alert("Error al procesar el archivo CSV.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [analysis, setAnalysis ] = useState<string  | null >(null);

  const handleAIAction = async () => {
    if (!currentComment) return;
    const result = await analyze(currentComment);
    if (!result) return;

    updateField('comentaryQuality', result.score);
    updateField('aiSuggestion', result.improvedVersion);
    updateField('comentaryStatus', 'analyzed');
    setAiSuggestion(result.improvedVersion);
    setAnalysis(result.analysis);
    setShowAISuggestion(true);
  };

  const acceptAISuggestion = () => {
    if (!aiSuggestion) return;
    updateField('comentary', aiSuggestion);
    updateField('comentaryStatus', 'improved');
    setAiSuggestion(null);
    setAnalysis(null);
    setShowAISuggestion(false);
  };

  const discardAISuggestion = () => setShowAISuggestion(false);

  const currentStudent = filteredStudents.find(s => s.id === selectedStudentId);

  if (isLoading || !schoolYear || !currentStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando Módulo...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500 text-black">
      
      <div className="flex flex-col gap-4 mb-8">
        {/* Tabs de Grupo Académico */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {visibleGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedLevelGroup(group.id)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedLevelGroup === group.id
                  ? 'bg-white text-primary shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Tabs de Atelier */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {visibleAteliers.map((atelier) => (
            <button
              key={atelier}
              onClick={() => setSelectedAtelier(atelier)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedAtelier === atelier
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {atelier === 'all' ? 'Todos los Ateliers' : atelier}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-black">
        <GradingHeader subjectName="Reporte Cualitativo" isSaving={false} saveSuccess={false} isEditable={isEditable} />
        
        <div className="flex flex-col items-end gap-3">
           <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl shadow-xl border border-white/10">
              <button 
                onClick={handleDownloadTemplate}
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
                {isEditable ? 'Edición Habilitada' : 'Bloqueado'}
                {isAdmin && isLockedByDate && ' (Bypass Admin)'}
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Resultado de Importación */}
      {importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                       <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Resultado de Importación</h3>
                 </div>
                 <button onClick={() => setImportResult(null)} className="p-2 text-slate-300 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">Cargados</p>
                    <p className="text-3xl font-black text-green-700">{importResult.success}</p>
                 </div>
                 <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                    <p className="text-[10px] font-black text-rose-600 uppercase mb-1">No Encontrados</p>
                    <p className="text-3xl font-black text-rose-700">{importResult.missing?.length || 0}</p>
                 </div>
              </div>

              {importResult.missing?.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Documentos no encontrados en el sistema:</p>
                   <div className="space-y-2">
                      {importResult.missing.map((doc: string) => (
                        <div key={doc} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">
                           {doc}
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <button 
                onClick={() => setImportResult(null)}
                className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all"
              >
                Entendido
              </button>
           </div>
        </div>
      )}

      <GradingFilters
        allYears={allYears}
        selectedYearId={selectedYearId}
        onYearChange={setSelectedYearId}
        schoolYear={schoolYear} 
        station={currentStation} 
        filteredSubjects={filteredSubjects}
        selectedStationId={selectedStationId} 
        selectedSubjectId={selectedSubjectId}
        selectedCourse={selectedCourse} 
        consolidationFilter="all" 
        selectedAtelier={selectedAtelier} 
        selectedAtelierType={selectedAtelierType}
        selectedAcademicLevel={selectedAcademicLevel} 
        selectedLevelGroup={selectedLevelGroup}
        searchTerm={searchTerm} 
        visibleGroups={visibleGroups}
        visibleAteliers={visibleAteliers}
        onStationChange={setSelectedStationId}
        onSubjectChange={setSelectedSubjectId} 
        onCourseChange={setSelectedCourse} 
        onConsolidationChange={() => {}}
        onAtelierChange={setSelectedAtelier} 
        onAtelierTypeChange={setSelectedAtelierType} 
        onAcademicLevelChange={setSelectedAcademicLevel} 
        onLevelGroupChange={setSelectedLevelGroup}
        onSearchChange={setSearchTerm}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          <StudentSidebar
          students={filteredStudents}
          selectedId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />

        <div className="flex-1 space-y-8 w-full">
          {currentStudent && currentComment ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              <CommentSection
                  currentComment={currentComment}
                  handleAIAction={handleAIAction}
                  isAnalyzing={isAnalyzing}
                  isEditable={isEditable}
                  showAISuggestion={showAISuggestion}
                  aiSuggestion={aiSuggestion}
                  analysis={analysis}
                  onAcceptAISuggestion={acceptAISuggestion}
                  onDiscardAISuggestion={discardAISuggestion}
                  updateField={updateField}
                />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
                <DimensionBlock 
                  title="Aprendizaje Académico" icon={<BrainCircuit />} color="bg-blue-50 text-blue-600" 
                  fields={[{ key: 'academicCons', label: 'Habilidades Consolidadas', tKey: 'academic_cons' }, { key: 'academicNon', label: 'Habilidades No Consolidadas', tKey: 'academic_non' }]}
                  current={currentComment} templates={templates} studentLevel={currentStudent.academic_level?.[0]} isEditable={isEditable} onUpdate={updateField} />
                
                <DimensionBlock 
                  title="Aprendizaje Emocional" icon={<Heart />} color="bg-rose-50 text-rose-600" 
                  fields={[{ key: 'emotionalSkills', label: 'Habilidades Socioemocionales', tKey: 'emotional_skills' }, { key: 'talents', label: 'Talentos', tKey: 'talents' }]}
                  current={currentComment} templates={templates} studentLevel={currentStudent.academic_level?.[0]} isEditable={isEditable} onUpdate={updateField} />

                <DimensionBlock 
                  title="Aprendizaje Convivencial" icon={<Users />} color="bg-green-50 text-green-600" 
                  fields={[{ key: 'socialInteraction', label: 'Interacción y Cooperación', tKey: 'social_interaction' }, { key: 'challenges', label: 'Desafíos', tKey: 'challenges' }]}
                  current={currentComment} templates={templates} studentLevel={currentStudent.academic_level?.[0]} isEditable={isEditable} onUpdate={updateField} />

                <DimensionBlock 
                  title="PIAR y Learning Crop" icon={<Sprout />} color="bg-emerald-50 text-emerald-600" 
                  fields={[{ key: 'piarDesc', label: 'Aplicación y Desarrollo PIAR', tKey: 'piar_desc' }, { key: 'learning_crop_desc', label: 'Vivencia Learning Crop', tKey: 'learning_crop_desc' }]}
                  current={currentComment} templates={templates} studentLevel={currentStudent.academic_level?.[0]} isEditable={isEditable} onUpdate={updateField} />
              </div>

              <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Users size={32} /></div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800">Nota de Convivencia</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Escala: 1 o 5 solamente</p>
                  </div>
                </div>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  maxLength={1} 
                  value={currentComment.convivenciaGrade || ''} 
                  onChange={e => updateField('convivenciaGrade', e.target.value)} 
                  disabled={!isEditable} 
                  className="w-32 p-6 text-center text-4xl font-black rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-amber-200 outline-none transition-all shadow-inner text-black" 
                  placeholder="-" 
                />
              </section>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
              <UserCircle size={64} className="text-slate-100 mb-6" />
              <p className="text-slate-400 font-black uppercase text-sm tracking-widest">Selecciona un seed para redactar el reporte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCommentsView;
