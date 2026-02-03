
import React from 'react';
import { Calendar, Wind, BookOpen, Clock, Layers, PlusCircle, Globe, Save, School, Loader2, Target, MessageSquareQuote } from 'lucide-react';
import { useGradingAdmin } from '../../hooks/useGradingAdmin';
import { StepIndicator, GradingFooter } from './components/GradingNavigation';

import {Step1Year } from './components/gradingSteps/Step1Year.tsx'
import {Step2Stations } from './components/gradingSteps/Step2Stations.tsx'
import {Step3Subjects } from './components/gradingSteps/Step3Subjects.tsx'
import {Step4Courses } from './components/gradingSteps/Step4Courses.tsx'
import {Step5Moments } from './components/gradingSteps/Step5Moments.tsx'
import {Step6Sections } from './components/gradingSteps/Step6Sections.tsx'
import {Step7GradeSlots } from './components/gradingSteps/Step7GradeSlots.tsx'
import {Step8Skills } from './components/gradingSteps/Step8Skills.tsx'
import {Step9CommentTemplates } from './components/gradingSteps/Step9CommentTemplates.tsx'
import {StepFinalSuccess } from './components/gradingSteps/StepFinalSuccess.tsx'

const GradingModule: React.FC = () => {
  const admin = useGradingAdmin();

  if (admin.isLoading || !admin.schoolYear) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando Sistema...</p>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Año Escolar', icon: Calendar },
    { id: 2, title: 'Estaciones', icon: Wind },
    { id: 3, title: 'Asignaturas', icon: BookOpen },
    { id: 4, title: 'Cursos y Mod.', icon: Globe },
    { id: 5, title: 'Momentos', icon: Clock },
    { id: 6, title: 'Secciones', icon: Layers },
    { id: 7, title: 'Notas', icon: PlusCircle },
    { id: 8, title: 'Habilidades', icon: Target },
    { id: 9, title: 'Plantillas Com.', icon: MessageSquareQuote },
  ];

  const renderContent = () => {
    switch (admin.currentStep) {
      case 1: return <Step1Year year={admin.schoolYear!} setYear={admin.setSchoolYear} />;
      case 2: return <Step2Stations year={admin.schoolYear!} setYear={admin.setSchoolYear} total={admin.validations.stationTotal} />;
      case 3: return (
        <Step3Subjects 
          year={admin.schoolYear!} 
          setYear={admin.setSchoolYear} 
          selectedIdx={admin.selectedStationIdx} 
          onSelectStation={admin.setSelectedStationIdx} 
          onMove={admin.moveSubject}
        />
      );
      case 4: return (
          <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right-4 duration-300">
            <div className="w-full md:w-1/4 space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Seleccionar Materia</p>
               <select value={admin.selectedSubjectIdx} onChange={(e) => admin.setSelectedSubjectIdx(Number(e.target.value))} className="w-full p-4 rounded-2xl text-xs text-black font-black border border-slate-200 bg-white shadow-sm">
                  {(admin.schoolYear!.stations[admin.selectedStationIdx].subjects || []).map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
               </select>
            </div>
            <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <Step4Courses station={admin.schoolYear!.stations[admin.selectedStationIdx]} subjectIdx={admin.selectedSubjectIdx} onToggle={admin.toggleCourse} />
            </div>
          </div>
      );
      case 5: return <Step5Moments year={admin.schoolYear!} setYear={admin.setSchoolYear} stationIdx={admin.selectedStationIdx} onSelectStation={admin.setSelectedStationIdx} total={admin.validations.momentTotal} />;
      case 6: return <Step6Sections year={admin.schoolYear!} setYear={admin.setSchoolYear} stationIdx={admin.selectedStationIdx} momentIdx={admin.selectedMomentIdx} onSelectStation={admin.setSelectedStationIdx} onSelectMoment={admin.setSelectedMomentIdx} onAdd={admin.addSection} total={admin.validations.sectionTotal} />;
      case 7: return <Step7GradeSlots year={admin.schoolYear!} setYear={admin.setSchoolYear} stationIdx={admin.selectedStationIdx} momentIdx={admin.selectedMomentIdx} sectionIdx={admin.selectedSectionIdx} subjectIdx={admin.selectedSubjectIdx} onSelectStation={admin.setSelectedStationIdx} onSelectMoment={admin.setSelectedMomentIdx} onSelectSection={admin.setSelectedSectionIdx} onSelectSubject={admin.setSelectedSubjectIdx} onAdd={admin.addGradeSlot} onMove={admin.moveGradeSlot} total={admin.validations.gradeTotal} />;
      case 8: return <Step8Skills year={admin.schoolYear!} setYear={admin.setSchoolYear} stationIdx={admin.selectedStationIdx} subjectIdx={admin.selectedSubjectIdx} onSelectStation={admin.setSelectedStationIdx} onSelectSubject={admin.setSelectedSubjectIdx} />;
      case 9: return (
        <Step9CommentTemplates 
          templates={admin.commentTemplates} 
          onAdd={admin.addCommentTemplate} 
          onBulkAdd={admin.addBulkTemplates}
          onRemove={admin.removeCommentTemplate} 
          onUpdate={admin.updateTemplateContent} 
          onClone={admin.cloneTemplates} 
        />
      );
      case 10: return <StepFinalSuccess onReset={() => admin.setCurrentStep(1)} />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto pb-40">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"><School size={40} /></div>
             Estructura 2026
          </h1>
        </div>
        <button onClick={admin.handleSave} disabled={admin.isSaving} className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-70">
          {admin.isSaving ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
          {admin.isSaving ? 'Guardando...' : 'Sincronizar Estructura'}
        </button>
      </header>

      {admin.currentStep <= steps.length && (
        <StepIndicator steps={steps} currentStep={admin.currentStep} onStepClick={admin.setCurrentStep} />
      )}
      
      <div className="min-h-[500px]">
        {renderContent()}
      </div>

      {admin.currentStep <= steps.length && (
        <GradingFooter currentStep={admin.currentStep} totalSteps={steps.length} onPrev={() => admin.setCurrentStep(s => s - 1)} onNext={() => admin.setCurrentStep(s => s + 1)} />
      )}
    </div>
  );
};

export default GradingModule;
