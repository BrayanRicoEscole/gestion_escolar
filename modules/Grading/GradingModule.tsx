
import React, { useState, useRef } from 'react';
import { 
  Calendar, Wind, BookOpen, Clock, Layers, PlusCircle, 
  Globe, Save, School, Loader2, Target, MessageSquareQuote, 
  ChevronRight, ArrowLeft, History, Plus, FileDown, FileUp
} from 'lucide-react';
import { useGradingAdmin } from '../../hooks/useGradingAdmin';
import { StepIndicator, GradingFooter } from './components/GradingNavigation';
import { generateYearTemplateCsv } from './utils/YearCsvService';

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
  const [showNewYearPrompt, setShowNewYearPrompt] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csv = generateYearTemplateCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Plantilla_Estructura_Academica.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      admin.importYearFromCsv(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (admin.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Conectando con el Servidor...</p>
      </div>
    );
  }

  // Vista de Selección de Año (Dashboard Inicial)
  if (!admin.schoolYear) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
             <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter flex items-center gap-4 text-black">
                <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"><School size={40} /></div>
                Años Escolares
             </h1>
             <p className="text-slate-500 font-medium text-lg">Administra las estructuras académicas de la institución</p>
           </div>
           
           <div className="flex gap-3 bg-slate-100 p-2 rounded-[2rem] border border-slate-200">
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all shadow-sm"
              >
                <FileDown size={16} /> Plantilla CSV
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={admin.isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {admin.isSaving ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} 
                Importar CSV
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportCsv} 
                accept=".csv" 
                className="hidden" 
              />
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {/* Botón Crear Nuevo */}
           <button 
             onClick={() => setShowNewYearPrompt(true)}
             className="h-64 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
           >
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-white shadow-sm">
                <Plus size={40} />
              </div>
              <span className="font-black uppercase text-xs tracking-widest">Crear Nuevo Año</span>
           </button>

           {/* Listado de Años Existentes */}
           {admin.allYears.map(year => (
             <button 
               key={year.id} 
               onClick={() => admin.loadYear(year.id)}
               className="h-64 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all text-left flex flex-col justify-between group"
             >
                <div className="flex justify-between items-start">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <History size={28} />
                   </div>
                   <ChevronRight className="text-slate-200 group-hover:text-primary" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estructura Académica</p>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{year.name}</h3>
                </div>
             </button>
           ))}
        </div>

        {/* Modal de Nuevo Año */}
        {showNewYearPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Nuevo Periodo Lectivo</h3>
                <p className="text-slate-500 text-sm mb-8">Ingresa el nombre descriptivo (ej: 2027, Ciclo 2026-B)</p>
                
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Nombre del año..." 
                  value={newYearName}
                  onChange={e => setNewYearName(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl font-black text-xl mb-8 focus:ring-4 focus:ring-primary/10 outline-none text-black"
                />

                <div className="flex gap-4">
                   <button onClick={() => setShowNewYearPrompt(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancelar</button>
                   <button 
                     onClick={() => { admin.createNewYear(newYearName); setShowNewYearPrompt(false); }}
                     disabled={!newYearName.trim()}
                     className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-30"
                   >
                     Inicializar
                   </button>
                </div>
             </div>
          </div>
        )}
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
      case 2: return <Step2Stations year={admin.schoolYear!} setYear={admin.setSchoolYear} total={admin.validations.stationTotal} onAdd={admin.addStation} onRemove={admin.removeStation} />;
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
                  {(admin.schoolYear!.stations[admin.selectedStationIdx]?.subjects || []).map((s, i) => <option key={s.id} value={i}>{s.name}</option>)}
               </select>
            </div>
            <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <Step4Courses station={admin.schoolYear!.stations[admin.selectedStationIdx]} subjectIdx={admin.selectedSubjectIdx} onToggle={admin.toggleCourse} />
            </div>
          </div>
      );
      case 5: return <Step5Moments year={admin.schoolYear!} setYear={admin.setSchoolYear} stationIdx={admin.selectedStationIdx} onSelectStation={admin.setSelectedStationIdx} total={admin.validations.momentTotal} onAdd={admin.addMoment} onRemove={admin.removeMoment} />;
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
        <div className="flex items-center gap-6">
          <button 
            onClick={() => admin.setSchoolYear(null)} 
            className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-1 tracking-tighter text-black">
               {admin.schoolYear.name}
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Editando Estructura Institucional</p>
          </div>
        </div>
        <button onClick={admin.handleSave} disabled={admin.isSaving} className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-70">
          {admin.isSaving ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
          {admin.isSaving ? 'Guardando...' : 'Sincronizar Cambios'}
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
