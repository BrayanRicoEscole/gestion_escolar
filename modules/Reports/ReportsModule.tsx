
import React, { useState } from 'react';
import { FileText, Settings, ShieldCheck, Clock, Loader2, FileCheck, CalendarSearch } from 'lucide-react';
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
    allYears,
    selectedYearId,
    setSelectedYearId,
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

  if (isLoading && allYears.length === 0) {
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
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500 text-black">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
            <FileText size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter text-black">Reportes Académicos</h1>
            </div>
            
            {/* Selector de Año Premium */}
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
               <CalendarSearch size={16} className="text-primary" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Año Lectivo</span>
                  <select 
                    value={selectedYearId}
                    onChange={e => setSelectedYearId(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm font-black text-slate-700 outline-none cursor-pointer focus:ring-0"
                  >
                    {allYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
               </div>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 shadow-inner">
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

      {/* Indicador de Carga al cambiar de año */}
      {isLoading ? (
         <div className="flex items-center justify-center py-20 bg-white/50 rounded-[3rem] backdrop-blur-sm border-2 border-dashed border-slate-100">
            <Loader2 className="animate-spin text-primary mr-3" />
            <span className="font-black text-slate-400 uppercase text-xs">Cambiando contexto académico...</span>
         </div>
      ) : (
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
      )}

      {/* Previsualización Dinámica */}
      <AcademicPreviewTable />
    </div>
  );
};
