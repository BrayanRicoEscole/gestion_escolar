
import React, { useState } from 'react';
import { FileText, Settings, ShieldCheck, Clock, Loader2, FileCheck } from 'lucide-react';
import { useReportsData } from './hooks/useReportsData';

// Componentes refactorizados
import { TabButton } from './components/Tabs/TabButton';
import { ValidationTab } from './components/Tabs/ValidationTab';
import { TemplatesTab } from './components/Tabs/TemplatesTab';
import { SpecialRulesTab } from './components/Tabs/SpecialRulesTab';
import { AcademicPreviewTable } from './components/Preview/AcademicPreviewTable';
import { FinalReportTab } from './components/Tabs/FinalReportTab';

type Tab = 'validation' | 'templates' | 'special_rules' | 'final_report';

export const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('validation');
  const { 
    isLoading, 
    schoolYear, 
    currentStation, 
    validationResults,
    filteredStudents,
    selectedStationId,
    setSelectedStationId,
    searchTerm,
    setSearchTerm,
    grades,
    allComments,
    skillSelections
  } = useReportsData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cruzando base de datos...</p>
          <p className="text-slate-300 text-[10px] mt-1">Validando notas, comentarios y paz y salvos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <FileText size={28} />
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter text-black">Reportes Académicos</h1>
               <p className="text-slate-500 font-medium italic">Sincronizado con Libro de Notas y Mentor IA</p>
             </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
           <TabButton 
             active={activeTab === 'validation'} 
             onClick={() => setActiveTab('validation')} 
             icon={ShieldCheck}
           >
             Cierre de Estación
           </TabButton>
           <TabButton 
             active={activeTab === 'final_report'} 
             onClick={() => setActiveTab('final_report')} 
             icon={FileCheck}
           >
             Certificación Anual
           </TabButton>
           <TabButton 
             active={activeTab === 'templates'} 
             onClick={() => setActiveTab('templates')} 
             icon={Settings}
           >
             Plantillas
           </TabButton>
           <TabButton 
             active={activeTab === 'special_rules'} 
             onClick={() => setActiveTab('special_rules')} 
             icon={Clock}
           >
             Configuración
           </TabButton>
        </div>
      </header>

      {/* Contenido de Pestañas */}
      <div className="min-h-[400px]">
        {activeTab === 'validation' && (
          <ValidationTab 
            validationResults={validationResults}
            schoolYear={schoolYear}
            currentStation={currentStation}
            selectedStationId={selectedStationId}
            setSelectedStationId={setSelectedStationId}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            allGrades={grades}
            allComments={allComments}
            skillSelections={skillSelections}
          />
        )}

        {activeTab === 'final_report' && (
          <FinalReportTab 
            students={filteredStudents}
            schoolYear={schoolYear}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            allGrades={grades}
            allComments={allComments}
            skillSelections={skillSelections}
          />
        )}

        {activeTab === 'templates' && <TemplatesTab />}

        {activeTab === 'special_rules' && <SpecialRulesTab />}
      </div>

      {/* Previsualización Dinámica */}
      <AcademicPreviewTable />
    </div>
  );
};
