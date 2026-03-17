import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledStudents } from '../../services/api/activeStudents.api';
import { getSchoolYearsList, getSchoolYear, isSubjectRelevant } from '../../services/api/schoolYear.api';
import { getAllStationReports, refreshStationReport, saveStationReport, getYearlyStationReports } from '../../services/api/reports.api';
import { getStudentYearlyComments } from '../../services/api/comments.api';
import { Card } from '../../components/ui/Card';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Info, UserCheck, ShieldCheck, Search, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Student, SchoolYear, Station, Subject, StationReport, StudentComment } from '../../types';
import { YearlySummaryModal } from './components/Preview/YearlySummaryModal';

const ACADEMIC_GROUPS = [
  { id: 'Petiné', name: 'Petiné', levels: ['C', 'D'] },
  { id: 'Elementary', name: 'Elementary', levels: ['E', 'F', 'G', 'H'] },
  { id: 'Middle', name: 'Middle', levels: ['I', 'J', 'K'] },
  { id: 'Highschool', name: 'Highschool', levels: ['L', 'M', 'N'] },
];

const ATELIER_TABS = ['all', 'Mónaco', 'Alhambra', 'Mandalay', 'Casa'] as const;

export const StationReportsModule: React.FC = () => {
  const { profile } = useAuth();
  const isSupport = profile?.role === 'support';

  const [students, setStudents] = useState<Student[]>([]);
  const [yearsList, setYearsList] = useState<{id: string, name: string}[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [currentYearData, setCurrentYearData] = useState<SchoolYear | null>(null);
  const [reports, setReports] = useState<StationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);

  // Tabs
  const [selectedGroupTab, setSelectedGroupTab] = useState<string>('Petiné');
  const [selectedAtelierTab, setSelectedAtelierTab] = useState<string>('all');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterModality, setFilterModality] = useState('all');
  const [filterCalendar, setFilterCalendar] = useState('all');
  const [filterConsolidation, setFilterConsolidation] = useState('all');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Yearly Summary State
  const [summaryStudent, setSummaryStudent] = useState<Student | null>(null);
  const [summaryReports, setSummaryReports] = useState<StationReport[]>([]);
  const [summaryComments, setSummaryComments] = useState<StudentComment[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const selectedStation = useMemo(() => currentYearData?.stations.find(s => s.id === selectedStationId), [currentYearData, selectedStationId]);
  const subjects = useMemo(() => selectedStation?.subjects || [], [selectedStation]);

  useEffect(() => {
    const init = async () => {
      try {
        const yearsListData = await getSchoolYearsList();
        setYearsList(yearsListData);
        if (yearsListData.length > 0) {
          setSelectedYearId(yearsListData[0].id);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      getSchoolYear(selectedYearId).then(yearData => {
        setCurrentYearData(yearData);
        const exists = yearData.stations.some(s => s.id === selectedStationId);
        if (!exists && yearData.stations.length > 0) {
          setSelectedStationId(yearData.stations[0].id);
        } else if (yearData.stations.length === 0) {
          setSelectedStationId('');
        }
      });
    }
  }, [selectedYearId]);

  useEffect(() => {
    if (selectedYearId && selectedStationId) {
      loadData();
    }
  }, [selectedYearId, selectedStationId, selectedGroupTab, selectedAtelierTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const group = ACADEMIC_GROUPS.find(g => g.id === selectedGroupTab);
      const filters = {
        levels: group?.levels,
        atelier: selectedAtelierTab
      };

      const studentsData = await getEnrolledStudents(selectedYearId, filters);
      setStudents(studentsData);

      const studentIds = studentsData.map(s => s.id!).filter(Boolean);
      const reportsData = await getAllStationReports(selectedYearId, selectedStationId, studentIds);
      setReports(reportsData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const report = reports.find(r => r.student_id === s.id);
      const hasGrades = report && Object.values(report.subject_data).some((d: any) => (d.value || 0) > 0);
      const globalAvg = report?.global_average || 0;

      // Check for pending grades (at least one relevant subject missing a grade)
      let hasPendingGrades = false;
      if (selectedStation) {
        for (const sub of subjects) {
          if (isSubjectRelevant(s, sub)) {
            const data = report?.subject_data[sub.id];
            if (!data || (data.value || 0) <= 0) {
              hasPendingGrades = true;
              break;
            }
          }
        }
      }

      const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.document.includes(searchTerm);
      const matchesGrade = filterGrade === 'all' || s.grade === filterGrade;
      const matchesModality = filterModality === 'all' || s.modality === filterModality;
      const matchesCalendar = filterCalendar === 'all' || s.calendario === filterCalendar;
      
      const matchesEndDate = !filterEndDate || (s.end_date && s.end_date.includes(filterEndDate));

      // Date validation: Student must be active during the station
      let matchesDates = true;
      if (selectedStation) {
        const stationStart = new Date(selectedStation.startDate);
        const stationEnd = new Date(selectedStation.endDate);
        
        if (s.start_date) {
          const studentStart = new Date(s.start_date);
          if (studentStart > stationEnd) matchesDates = false;
        }
        
        if (s.end_date) {
          const studentEnd = new Date(s.end_date);
          if (studentEnd < stationStart) matchesDates = false;
        }
      }

      const matchesConsolidation = filterConsolidation === 'all' || 
                                  (filterConsolidation === 'consolidated' && globalAvg >= 3.7) ||
                                  (filterConsolidation === 'not_consolidated' && globalAvg > 0 && globalAvg < 3.7) ||
                                  (filterConsolidation === 'pending_grades' && hasPendingGrades) ||
                                  (filterConsolidation === 'no_grades' && !hasGrades);

      return matchesSearch && matchesGrade && matchesModality && matchesCalendar && matchesConsolidation && matchesDates && matchesEndDate;
    });
  }, [students, reports, searchTerm, filterGrade, filterModality, filterCalendar, filterConsolidation, filterEndDate, selectedStation]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  // Filter options
  const filterOptions = useMemo(() => {
    return {
      grades: Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort(),
      ateliers: Array.from(new Set(students.map(s => s.atelier).filter(Boolean))).sort(),
      modalities: Array.from(new Set(students.map(s => s.modality).filter(Boolean))).sort(),
      levels: Array.from(new Set(students.map(s => s.academic_level).filter(Boolean))).sort(),
      calendars: Array.from(new Set(students.map(s => s.calendario).filter(Boolean))).sort(),
    };
  }, [students]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade, filterModality, filterCalendar, filterConsolidation]);

  const handleRefresh = async (studentId: string) => {
    if (!selectedStation || !selectedYearId) return;
    setRefreshing(studentId);
    try {
      const newReport = await refreshStationReport(
        studentId,
        selectedYearId,
        selectedStationId,
        selectedStation,
        subjects
      );
      setReports(prev => {
        const index = prev.findIndex(r => r.student_id === studentId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newReport;
          return updated;
        }
        return [...prev, newReport];
      });
    } catch (error) {
      console.error("Error refreshing report:", error);
    } finally {
      setRefreshing(null);
    }
  };

  const handleOpenSummary = async (student: Student) => {
    if (!selectedYearId) return;
    setSummaryStudent(student);
    setLoadingSummary(true);
    try {
      const [reportsData, commentsData] = await Promise.all([
        getYearlyStationReports(selectedYearId, student.id!),
        getStudentYearlyComments(student.id!)
      ]);
      setSummaryReports(reportsData);
      setSummaryComments(commentsData);
    } catch (error) {
      console.error("Error loading yearly summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRefreshAll = async () => {
    if (!selectedStation || !selectedYearId || !window.confirm("¿Deseas recalcular los reportes de todos los estudiantes filtrados? Esto puede tardar un poco.")) return;
    setGlobalRefreshing(true);
    try {
      for (const student of filteredStudents) {
        await refreshStationReport(
          student.id!,
          selectedYearId,
          selectedStationId,
          selectedStation,
          subjects
        );
      }
      await loadData();
    } catch (error) {
      console.error("Error refreshing all reports:", error);
    } finally {
      setGlobalRefreshing(false);
    }
  };

  const handleManualEdit = async (studentId: string, subjectId: string, newValue: string) => {
    if (!isSupport || !profile) return;
    const val = parseFloat(newValue);
    if (isNaN(val)) return;

    let report = reports.find(r => r.student_id === studentId);
    
    // If report doesn't exist, we must refresh it first to have a base
    if (!report) {
      if (!selectedStation) return;
      report = await refreshStationReport(studentId, selectedYearId, selectedStationId, selectedStation, subjects);
    }

    const updatedSubjectData = {
      ...report.subject_data,
      [subjectId]: {
        value: val,
        is_manual: true,
        edited_by: profile.id,
        edited_at: new Date().toISOString()
      }
    };

    // Recalculate global average if not manual
    let globalAvg = report.global_average;
    if (!report.is_global_manual) {
      const values = Object.values(updatedSubjectData).map((d: any) => d.value);
      globalAvg = values.length > 0 ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
    }

    try {
      const saved = await saveStationReport({
        ...report,
        subject_data: updatedSubjectData,
        global_average: globalAvg
      });
      setReports(prev => {
        const exists = prev.find(r => r.id === saved.id);
        if (exists) return prev.map(r => r.id === saved.id ? saved : r);
        return [...prev, saved];
      });
    } catch (error) {
      console.error("Error saving manual edit:", error);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando consolidado...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 text-black">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} />
            Consolidado de Estación
          </h1>
          <p className="text-slate-500 font-medium mt-1">Resultados finales y nivelaciones por periodo académico</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <select 
              value={selectedYearId} 
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="bg-transparent px-4 py-2 text-xs font-black uppercase tracking-widest outline-none"
            >
              {yearsList.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <select 
              value={selectedStationId} 
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent px-4 py-2 text-xs font-black uppercase tracking-widest outline-none border-l border-slate-200"
            >
              {currentYearData?.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={handleRefreshAll}
            disabled={globalRefreshing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {globalRefreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Recalcular Todo
          </button>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="text-blue-500 mt-0.5" size={18} />
        <div className="text-xs text-blue-700 font-medium leading-relaxed">
          <p><strong>Nota:</strong> Los resultados se calculan automáticamente a partir de las notas de la estación. 
          {isSupport && " Como Support, puedes editar los valores finales para aplicar nivelaciones; estas notas se marcarán en naranja y no se recalcularán automáticamente."}</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Tabs de Grupo Académico */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {ACADEMIC_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupTab(group.id)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedGroupTab === group.id
                  ? 'bg-white text-indigo-600 shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Tabs de Atelier */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {ATELIER_TABS.map((atelier) => (
            <button
              key={atelier}
              onClick={() => setSelectedAtelierTab(atelier)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedAtelierTab === atelier
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              {atelier === 'all' ? 'Todos los Ateliers' : atelier}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <select 
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos los Grados</option>
          {filterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select 
          value={filterModality}
          onChange={(e) => setFilterModality(e.target.value)}
          className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todas las Modalidades</option>
          {filterOptions.modalities.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select 
          value={filterConsolidation}
          onChange={(e) => setFilterConsolidation(e.target.value)}
          className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos los Estudiantes</option>
          <option value="pending_grades">Notas Pendientes</option>
          <option value="consolidated">Consolidan (≥ 3.7)</option>
          <option value="not_consolidated">No Consolidan (&lt; 3.7)</option>
          <option value="no_grades">Sin Notas</option>
        </select>

        <select 
          value={filterCalendar}
          onChange={(e) => setFilterCalendar(e.target.value)}
          className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos los Calendarios</option>
          <option value="A">Calendario A</option>
          <option value="B">Calendario B</option>
          <option value="C">Calendario C</option>
        </select>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase text-slate-400 ml-2">Cierre Estudiante</span>
          <input 
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {paginatedStudents.length > 0 ? (
        <Card className="overflow-hidden border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] sticky left-0 bg-slate-900 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Estudiante</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800">Info Académica</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800">Inicio / Cierre</th>
                  {subjects.map(s => (
                    <th key={s.id} className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800 min-w-[120px]">{s.name}</th>
                  ))}
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800 bg-indigo-900">Promedio</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800">Sinc.</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map(student => {
                  const report = reports.find(r => r.student_id === student.id);
                  return (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                          <span>{student.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{student.document}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center border-l border-slate-50">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">{student.grade}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase">{student.atelier}</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase">{student.academic_level}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center border-l border-slate-50">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Inicio: {student.start_date || '—'}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Cierre: {student.end_date || '—'}</span>
                        </div>
                      </td>
                      {subjects.map(subject => {
                        const data = report?.subject_data[subject.id];
                        const isRelevant = isSubjectRelevant(student, subject);
                        
                        if (!isRelevant) {
                          return (
                            <td key={subject.id} className="p-2 text-center border-l border-slate-50 bg-slate-50/50">
                              <span className="text-xs font-black text-slate-300">-</span>
                            </td>
                          );
                        }

                        const isLow = (data?.value || 0) > 0 && (data?.value || 0) < 3.7;

                        return (
                          <td key={subject.id} className="p-2 text-center border-l border-slate-50">
                            {isSupport ? (
                              <div className="relative group/cell">
                                <input 
                                  type="number"
                                  step="0.1"
                                  defaultValue={data?.value ?? ''}
                                  key={`${student.id}-${subject.id}-${data?.value}`}
                                  onBlur={(e) => {
                                    if (e.target.value !== String(data?.value ?? '')) {
                                      handleManualEdit(student.id!, subject.id, e.target.value);
                                    }
                                  }}
                                  className={`w-20 text-center p-2 rounded-lg text-xs font-black transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${data?.is_manual ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'} ${isLow ? 'text-red-600' : ''}`}
                                />
                                {data?.is_manual && (
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover/cell:block bg-slate-800 text-white text-[9px] p-2 rounded-lg whitespace-nowrap z-30 shadow-xl">
                                    Nivelado por Support
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className={`text-xs font-black ${data?.is_manual ? 'text-amber-600' : isLow ? 'text-red-600' : 'text-slate-600'}`}>
                                {data?.value !== undefined && data.value > 0 ? data.value : '-'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center border-l border-slate-50 bg-indigo-50/30">
                        <span className={`text-sm font-black ${report?.global_average && report.global_average < 3.7 ? 'text-red-600' : 'text-indigo-700'}`}>
                          {report?.global_average !== undefined && report.global_average > 0 ? report.global_average : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center border-l border-slate-50">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenSummary(student)}
                            className="p-2 hover:bg-amber-100 text-amber-600 rounded-xl transition-all"
                            title="Resumen Anual"
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                            onClick={() => handleRefresh(student.id!)}
                            disabled={refreshing === student.id}
                            className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all disabled:opacity-50"
                            title="Recalcular desde notas"
                          >
                            <RefreshCw size={16} className={refreshing === student.id ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Mostrando {paginatedStudents.length} de {filteredStudents.length} estudiantes
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Filas:</span>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </Card>
      ) : (
        <div className="mt-10 text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
            <UserCheck size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Sin estudiantes vinculados</h3>
          <p className="text-slate-400 text-sm max-w-md mt-2 font-medium">
            No se encontraron estudiantes registrados para los filtros seleccionados. 
            Asegúrate de que los estudiantes estén matriculados en el periodo <strong>{currentYearData?.name}</strong>.
          </p>
        </div>
      )}

      {summaryStudent && currentYearData && (
        <YearlySummaryModal 
          student={summaryStudent}
          schoolYear={currentYearData}
          reports={summaryReports}
          comments={summaryComments}
          onClose={() => setSummaryStudent(null)}
        />
      )}

      {loadingSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cruzando datos anuales...</p>
          </div>
        </div>
      )}
    </div>
  );
};
