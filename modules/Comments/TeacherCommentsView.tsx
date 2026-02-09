
import React, { useState } from 'react';
import {
  Loader2, Lock, Unlock, BrainCircuit, Heart, Users,
  UserCircle,  Sprout
} from 'lucide-react';
import { useGrading } from '../../hooks/useGrading';
import { saveStudentComment } from '../../services/api';

import { GradingHeader } from '../Grading/components/TeacherGradingView/components/GradingHeader';
import { GradingFilters } from '../Grading/components/TeacherGradingView/components/GradingFilters';

import { StudentSidebar } from './components/StudentSidebar';
import { DimensionBlock } from './components/DimensionBlock';
import { CommentSection } from './components/CommentSection';

import { useTeacherComments } from './hooks/useTeacherComments';
import { useDateLock } from './hooks/useDateLock';

import { useMentorAI } from './hooks/useMentorAI';



export const TeacherCommentsView: React.FC = () => {
  const grading = useGrading();
  const {
    isLoading = true,
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
    selectedModality,
    setSelectedModality,
    selectedAcademicLevel,
    setSelectedAcademicLevel,
    searchTerm,
    setSearchTerm,
  } = grading ?? {};

  const isEditable = useDateLock(currentStation);
  const { analyze, isAnalyzing } = useMentorAI();

  const {
    templates,
    selectedStudentId,
    setSelectedStudentId,
    currentComment,
    updateField,
  } = useTeacherComments({
    schoolYear,
    stationId: selectedStationId,
    students: filteredStudents,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
  setAiSuggestion(result.improvedVersion)
  setAnalysis(result.analysis)
  setShowAISuggestion(true);
};

  const acceptAISuggestion = () => {
  if (aiSuggestion) return;

  updateField('comentary', aiSuggestion);
  
  updateField('comentaryStatus', 'improved');
  setAiSuggestion(null);
  setAnalysis(null);
  setShowAISuggestion(false);
};

  const discardAISuggestion = () => setShowAISuggestion(false);

  
  const onSave = async () => {
    if (!currentComment || !isEditable) return;
    setIsSaving(true);
    console.log("[UI] Guardando reporte cualitativo...");
    try {
      await saveStudentComment(currentComment);
      console.log("[UI] Guardado exitoso.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("[UI] Error al guardar:", err);
      alert("Error al sincronizar con la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-black">
        <GradingHeader subjectName="Reporte Cualitativo" isSaving={isSaving} saveSuccess={saveSuccess} onSave={onSave} isEditable={isEditable} />
        <div className="flex flex-col items-end gap-2 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEditable ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
            {isEditable ? <Unlock size={12} /> : <Lock size={12} />}
            {isEditable ? 'Edición Habilitada' : 'Bloqueado'}
          </div>
        </div>
      </div>

      <GradingFilters
        schoolYear={schoolYear} station={currentStation} selectedStationId={selectedStationId} selectedSubjectId={selectedSubjectId}
        selectedCourse={selectedCourse} consolidationFilter="all" selectedAtelier={selectedAtelier} selectedModality={selectedModality}
        selectedAcademicLevel={selectedAcademicLevel} searchTerm={searchTerm} onStationChange={setSelectedStationId}
        onSubjectChange={setSelectedSubjectId} onCourseChange={setSelectedCourse} onConsolidationChange={() => {}}
        onAtelierChange={setSelectedAtelier} onModalityChange={setSelectedModality} onAcademicLevelChange={setSelectedAcademicLevel} onSearchChange={setSearchTerm}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Lista de Seeds */}
          <StudentSidebar
          students={filteredStudents}
          selectedId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />

        {/* Editor de Reporte */}
        <div className="flex-1 space-y-8 w-full">
          {currentStudent && currentComment ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* Síntesis Final e IA */}
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


              {/* Secciones Pedagógicas */}
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
                  fields={[{ key: 'piarDesc', label: 'Aplicación y Desarrollo PIAR', tKey: 'piar_desc' }, { key: 'learningCropDesc', label: 'Vivencia Learning Crop', tKey: 'learning_crop_desc' }]}
                  current={currentComment} templates={templates} studentLevel={currentStudent.academic_level?.[0]} isEditable={isEditable} onUpdate={updateField} />
              </div>

              {/* Nota de Convivencia Numérica */}
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
