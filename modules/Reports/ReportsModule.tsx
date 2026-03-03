
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
    paginatedStudents,
    totalStudents,
    currentPage,
    setCurrentPage,
    pageSize,
    selectedLevelGroup,
    setSelectedLevelGroup,
    selectedAtelier,
    setSelectedAtelier,
    selectedAcademicLevel,
    setSelectedAcademicLevel,
    selectedCalendar,
    setSelectedCalendar,
    selectedStationId,
    setSelectedStationId,
    searchTerm,
    setSearchTerm,
    grades,
    allComments,
    skillSelections,
    showIncompleteOnly,
    setShowIncompleteOnly,
    selectedStations,
    setSelectedStations,
    fetchStudentData,
    fetchYearStudentData
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

  const totalPages = Math.ceil(totalStudents / pageSize);

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500 text-black">
      
      <div className="flex flex-col gap-4 mb-8">
        {/* Tabs de Grupo Académico para Optimización */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {(['Petiné', 'Elementary', 'Middle', 'Highschool'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setSelectedLevelGroup(group)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedLevelGroup === group
                  ? 'bg-white text-primary shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Tabs de Atelier para Optimización de Query */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {(['all', 'Mónaco', 'Alhambra', 'Mandalay', 'Casa'] as const).map((atelier) => (
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
              fetchStudentData={fetchStudentData}
              showIncompleteOnly={showIncompleteOnly}
              setShowIncompleteOnly={setShowIncompleteOnly}
            />
          )}

          {activeTab === 'final_report' && (
            <FinalReportTab 
              students={paginatedStudents}
              schoolYear={schoolYear}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              allGrades={grades}
              allComments={allComments}
              skillSelections={skillSelections}
              fetchYearStudentData={fetchYearStudentData}
              selectedCalendar={selectedCalendar}
              setSelectedCalendar={setSelectedCalendar}
              selectedStations={selectedStations}
              setSelectedStations={setSelectedStations}
            />
          )}

          {activeTab === 'templates' && <TemplatesTab />}

          {activeTab === 'special_rules' && <SpecialRulesTab />}
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-3 px-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white disabled:opacity-20 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed"
                >
                  <FileText size={14} className="rotate-90 group-hover:-translate-x-1 transition-transform" /> Anterior
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum = currentPage;
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      if (pageNum <= 0 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border-2 ${
                            currentPage === pageNum
                              ? 'bg-primary border-primary text-white shadow-lg scale-110 z-10'
                              : 'bg-white border-transparent text-slate-400 hover:border-slate-100 hover:text-slate-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  {totalPages > 5 && <span className="text-slate-300 font-black">...</span>}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white hover:bg-primary disabled:opacity-20 disabled:hover:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed shadow-xl"
                >
                  Siguiente <FileText size={14} className="-rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Mostrando <span className="text-slate-900">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalStudents)}</span> de <span className="text-slate-900">{totalStudents}</span> estudiantes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Previsualización Dinámica */}
      <AcademicPreviewTable />
    </div>
  );
};
