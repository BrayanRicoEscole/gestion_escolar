import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnrolledStudents } from '../../services/api/activeStudents.api';
import { getSchoolYearsList, getSchoolYear, isSubjectRelevant } from '../../services/api/schoolYear.api';
import { getAllStationReports, refreshStationReport, saveStationReport, getYearlyStationReports } from '../../services/api/reports.api';
import { getStudentYearlyComments, getStudentComments } from '../../services/api/comments.api';
import { getGrowerAssignments } from '../../services/api/growerAssignments.api';
import { Card } from '../../components/ui/Card';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Info, UserCheck, ShieldCheck, Search, Filter, ChevronLeft, ChevronRight, FileText, Users } from 'lucide-react';
import { Student, SchoolYear, Station, Subject, StationReport, StudentComment, GrowerAssignment } from '../../types';
import { YearlySummaryModal } from './components/Preview/YearlySummaryModal';

const ACADEMIC_GROUPS = [
  { id: 'Petiné', name: 'Petiné', levels: ['C'] },
  { id: 'Elementary', name: 'Elementary', levels: ['D', 'E', 'F', 'G'] },
  { id: 'Middle', name: 'Middle', levels: ['H', 'I', 'J', 'K'] },
  { id: 'Highschool', name: 'Highschool', levels: ['L', 'M', 'N'] },
];

const ATELIER_TABS = ['all', 'Mónaco', 'Alhambra', 'Mandalay', 'Casa'] as const;

export const StationReportsModule: React.FC = () => {
  const { profile, isProfileLoading } = useAuth();
  const isSupport = profile?.role?.toLowerCase() === 'support';

  const [students, setStudents] = useState<Student[]>([]);
  const [yearsList, setYearsList] = useState<{id: string, name: string}[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [currentYearData, setCurrentYearData] = useState<SchoolYear | null>(null);
  const [reports, setReports] = useState<StationReport[]>([]);
  const [assignments, setAssignments] = useState<GrowerAssignment[]>([]);
  const [allComments, setAllComments] = useState<StudentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);

  // Tabs
  const [selectedGroupTab, setSelectedGroupTab] = useState<string | null>(null);
  const [selectedAtelierTab, setSelectedAtelierTab] = useState<string>('all');

  // Visible Groups for Growers
  const visibleGroups = useMemo(() => {
    if (!profile) return [];
    if (isSupport) return ACADEMIC_GROUPS;
    
    // Find levels where the grower has assignments in this station
    const growerAssignments = assignments.filter(a => a.grower_id === profile.id);
    
    if (growerAssignments.length === 0) return [];

    return ACADEMIC_GROUPS.filter(group => {
      return group.levels.some(level => {
        const cleanLevel = level.toLowerCase().trim();
        return growerAssignments.some(a => {
          const assignmentLevel = (a.academic_level || '').toLowerCase().trim();
          const assignmentCourse = (a.course || '').toLowerCase().trim();
          
          // Match if assignmentLevel is the group name (e.g., "Elementary")
          if (assignmentLevel === group.id.toLowerCase()) return true;
          
          // Clean the assignment level/course to get the base level (e.g., "h1-ms" -> "h1")
          const cleanAssignmentLevel = assignmentLevel.match(/^[a-z][0-9]*/)?.[0] || assignmentLevel;
          const cleanAssignmentCourse = assignmentCourse.match(/^[a-z][0-9]*/)?.[0] || assignmentCourse;

          // Match if assignmentLevel or assignmentCourse starts with a level that belongs to this group
          return cleanAssignmentLevel.startsWith(cleanLevel) || cleanAssignmentCourse.startsWith(cleanLevel);
        });
      });
    });
  }, [isSupport, profile, assignments]);

  // Visible Ateliers for Growers
  const visibleAteliers = useMemo(() => {
    if (isSupport) return ATELIER_TABS;
    const growerAssignments = assignments.filter(a => a.grower_id === profile?.id);
    const ateliers = new Set<string>(['all']);
    
    growerAssignments.forEach(a => {
      if (a.atelier) {
        const lowerAtelier = a.atelier.toLowerCase();
        if (lowerAtelier.includes('casa')) ateliers.add('Casa');
        if (lowerAtelier.includes('alhambra')) ateliers.add('Alhambra');
        if (lowerAtelier.includes('mandalay')) ateliers.add('Mandalay');
        if (lowerAtelier.includes('mónaco') || lowerAtelier.includes('monaco')) ateliers.add('Mónaco');
      }
    });

    return ATELIER_TABS.filter(t => ateliers.has(t));
  }, [isSupport, assignments, profile]);

  // Auto-select first visible group
  useEffect(() => {
    if (visibleGroups.length > 0) {
      if (!selectedGroupTab || !visibleGroups.some(g => g.id === selectedGroupTab)) {
        setSelectedGroupTab(visibleGroups[0].id);
      }
    }
  }, [visibleGroups, selectedGroupTab]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterModality, setFilterModality] = useState('all');
  const [filterCalendar, setFilterCalendar] = useState('all');
  const [filterConsolidation, setFilterConsolidation] = useState('all');
  const [filterGrower, setFilterGrower] = useState('all');
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

  useEffect(() => {
    if (selectedStationId) {
      getGrowerAssignments().then(data => {
        const filtered = data.filter(a => a.station_id === selectedStationId);
        setAssignments(filtered);
      });
    }
  }, [selectedStationId]);

  const loadData = async () => {
    if (!selectedGroupTab || !selectedStationId || !selectedYearId) return;
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
      const [reportsData, commentsData] = await Promise.all([
        getAllStationReports(selectedYearId, selectedStationId, studentIds),
        getStudentComments(selectedStationId)
      ]);
      
      setReports(reportsData);
      setAllComments(commentsData);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.map(s => {
      const studentLevel = (s.academic_level || '').toLowerCase().trim();
      const studentAtelier = (s.atelier || '').toLowerCase().trim();
      
      // Check if student belongs to the selected academic group tab
      const currentGroup = ACADEMIC_GROUPS.find(g => g.id === selectedGroupTab);
      const matchesGroup = !selectedGroupTab || (currentGroup?.levels.some(level => {
        const cleanLevel = level.toLowerCase().trim();
        return studentLevel.startsWith(cleanLevel);
      }) ?? false);

      if (!matchesGroup) return { ...s, matchesSearch: false, isAssignedToGrower: false };

      const report = reports.find(r => r.student_id === s.id);
      const comment = allComments.find(c => c.studentId === s.id);
      const hasGrades = report && Object.values(report.subject_data).some((d: any) => (d.value || 0) > 0);
      const globalAvg = report?.global_average || 0;

      // Check for pending grades and assigned growers
      let hasPendingGrades = false;
      let pendingGrowers = new Set<string>();
      let assignedGrowers = new Set<string>();

      // Calculate student course code for assignment matching
      let suffix = 'C';
      if (studentAtelier.includes('alhambra')) suffix = 'A';
      else if (studentAtelier.includes('mandalay')) suffix = 'MS';
      else if (studentAtelier.includes('mónaco') || studentAtelier.includes('monaco')) suffix = 'M';
      else if (studentAtelier.includes('casa')) suffix = 'C';

      const rawLevel = (s.academic_level || '').trim().toUpperCase();
      const match = rawLevel.match(/^[A-Z][0-9]*/);
      let cleanedLevel = match ? match[0] : 'N/A';
      if (cleanedLevel.length === 1 && cleanedLevel !== 'N/A') cleanedLevel += '1';
      
      const studentLevelClean = cleanedLevel.toLowerCase();
      const studentCourseCode = `${cleanedLevel}-${suffix}`;

      if (selectedStation) {
        for (const sub of subjects) {
          if (isSubjectRelevant(s, sub)) {
            // Find grower assigned to this subject/student
            const assignment = assignments.find(a => {
              if (a.subject_id !== sub.id) return false;

              const assignmentLevel = (a.academic_level || '').toLowerCase().trim();
              const assignmentAtelier = (a.atelier || '').toLowerCase().trim();
              const assignmentCourse = (a.course || '').toLowerCase().trim();

              const levelMatch = !assignmentLevel || 
                                studentLevelClean.includes(assignmentLevel) || 
                                assignmentLevel.includes(studentLevelClean) ||
                                (ACADEMIC_GROUPS.find(g => g.id.toLowerCase() === assignmentLevel)?.levels.some(l => studentLevelClean.startsWith(l.toLowerCase())) ?? false);

              const atelierMatch = !assignmentAtelier || studentAtelier.includes(assignmentAtelier) || assignmentAtelier.includes(studentAtelier);
              const courseMatch = !assignmentCourse || 
                                 studentCourseCode.toLowerCase().includes(assignmentCourse) || 
                                 assignmentCourse.includes(studentCourseCode.toLowerCase()) ||
                                 rawLevel.toLowerCase().includes(assignmentCourse) ||
                                 assignmentCourse.includes(rawLevel.toLowerCase());

              return (levelMatch && atelierMatch) || courseMatch;
            });

            if (assignment) {
              assignedGrowers.add(assignment.grower_id);
              
              const data = report?.subject_data[sub.id];
              if (!data || (data.value || 0) <= 0) {
                hasPendingGrades = true;
                pendingGrowers.add(assignment.grower_id);
              }
            }
          }
        }
      }

      const hasPendingComments = !comment || !comment.academicCons || !comment.academicNon || !comment.emotionalSkills;
      if (selectedStation) {
        const relevantAssignments = assignments.filter(a => {
          const assignmentLevel = (a.academic_level || '').toLowerCase().trim();
          const assignmentAtelier = (a.atelier || '').toLowerCase().trim();
          const assignmentCourse = (a.course || '').toLowerCase().trim();
          
          const levelMatch = !assignmentLevel || 
                            studentLevelClean.includes(assignmentLevel) || 
                            assignmentLevel.includes(studentLevelClean) ||
                            (ACADEMIC_GROUPS.find(g => g.id.toLowerCase() === assignmentLevel)?.levels.some(l => studentLevelClean.startsWith(l.toLowerCase())) ?? false);

          const atelierMatch = !assignmentAtelier || studentAtelier.includes(assignmentAtelier) || assignmentAtelier.includes(studentAtelier);
          const courseMatch = !assignmentCourse || 
                             studentCourseCode.toLowerCase().includes(assignmentCourse) || 
                             assignmentCourse.includes(studentCourseCode.toLowerCase()) ||
                             rawLevel.toLowerCase().includes(assignmentCourse) ||
                             assignmentCourse.includes(rawLevel.toLowerCase());
          
          return (levelMatch && atelierMatch) || courseMatch;
        });

        relevantAssignments.forEach(a => {
          assignedGrowers.add(a.grower_id);
          if (hasPendingComments) {
            pendingGrowers.add(a.grower_id);
          }
        });
      }

      const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.document?.includes(searchTerm);
      const matchesGrade = filterGrade === 'all' || s.grade === filterGrade;
      const matchesModality = filterModality === 'all' || s.modality === filterModality;
      const matchesCalendar = filterCalendar === 'all' || s.calendario === filterCalendar;
      
      const matchesEndDate = !filterEndDate || (s.end_date && s.end_date.includes(filterEndDate));

      const matchesGrower = filterGrower === 'all' || assignedGrowers.has(filterGrower);

      // Date validation: Student must be active during the station
      let matchesDates = true;
      if (selectedStation && selectedStation.startDate && selectedStation.endDate) {
        const stationStart = new Date(selectedStation.startDate);
        const stationEnd = new Date(selectedStation.endDate);
        
        if (!isNaN(stationStart.getTime()) && !isNaN(stationEnd.getTime())) {
          if (s.start_date) {
            const studentStart = new Date(s.start_date);
            // Allow 1 day grace period for timezone issues
            const adjustedStationEnd = new Date(stationEnd);
            adjustedStationEnd.setDate(adjustedStationEnd.getDate() + 1);
            if (!isNaN(studentStart.getTime()) && studentStart > adjustedStationEnd) matchesDates = false;
          }
          
          if (s.end_date) {
            const studentEnd = new Date(s.end_date);
            // Allow 1 day grace period for timezone issues
            const adjustedStationStart = new Date(stationStart);
            adjustedStationStart.setDate(adjustedStationStart.getDate() - 1);
            if (!isNaN(studentEnd.getTime()) && studentEnd < adjustedStationStart) matchesDates = false;
          }
        }
      }

      const matchesConsolidation = filterConsolidation === 'all' || 
                                   (filterConsolidation === 'consolidated' && globalAvg >= 3.7) ||
                                   (filterConsolidation === 'not_consolidated' && globalAvg > 0 && globalAvg < 3.7) ||
                                   (filterConsolidation === 'pending_grades' && hasPendingGrades) ||
                                   (filterConsolidation === 'pending_comments' && hasPendingComments) ||
                                   (filterConsolidation === 'no_grades' && !hasGrades);

      const isStationClosed = selectedStation ? new Date(selectedStation.endDate) < new Date() : false;
      const isCritical = isStationClosed && (hasPendingGrades || hasPendingComments);

      const isAssignedToGrower = isSupport || assignedGrowers.has(profile?.id || '');

      return {
        ...s,
        hasPendingGrades,
        hasPendingComments,
        isCritical,
        isAssignedToGrower,
        matchesSearch,
        matchesGrade,
        matchesModality,
        matchesCalendar,
        matchesConsolidation,
        matchesDates,
        matchesEndDate,
        matchesGrower
      };
    }).filter((s: any) => 
      s.matchesSearch && 
      s.matchesGrade && 
      s.matchesModality && 
      s.matchesCalendar && 
      s.matchesConsolidation && 
      s.matchesDates && 
      s.matchesEndDate && 
      s.matchesGrower &&
      s.isAssignedToGrower
    );
  }, [students, reports, allComments, searchTerm, filterGrade, filterModality, filterCalendar, filterConsolidation, filterEndDate, filterGrower, selectedStation, subjects, assignments, isSupport, profile, selectedGroupTab]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  // Filter options
  const filterOptions = useMemo(() => {
    const uniqueGrowers = Array.from(new Set(assignments.map(a => JSON.stringify({id: a.grower_id, name: a.grower_name}))))
      .map(s => JSON.parse(s as string))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      grades: Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort(),
      ateliers: Array.from(new Set(students.map(s => s.atelier).filter(Boolean))).sort(),
      modalities: Array.from(new Set(students.map(s => s.modality).filter(Boolean))).sort(),
      levels: Array.from(new Set(students.map(s => s.academic_level).filter(Boolean))).sort(),
      calendars: Array.from(new Set(students.map(s => s.calendario).filter(Boolean))).sort(),
      growers: uniqueGrowers
    };
  }, [students, assignments]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade, filterModality, filterCalendar, filterConsolidation, filterGrower]);

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

  if ((loading || isProfileLoading) && students.length === 0) {
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

      {!isSupport && profile && assignments.some(a => a.grower_id === profile.id) && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-wrap gap-2 items-center">
          <ShieldCheck className="text-indigo-500" size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mr-2">Tus Asignaciones:</span>
          {assignments
            .filter(a => a.grower_id === profile.id)
            .map((a, idx) => (
              <span key={idx} className="bg-white px-3 py-1 rounded-full text-[9px] font-bold text-indigo-600 border border-indigo-200 shadow-sm">
                {a.course || a.academic_level || 'Materia Específica'} 
                {a.subject_id && ` (${subjects.find(s => s.id === a.subject_id)?.name || 'Materia'})`}
              </span>
            ))}
        </div>
      )}

      {/* Tabs Section */}
      <div className="flex flex-col gap-4 mb-8">
        {visibleGroups.length === 0 && !isSupport && !isProfileLoading && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
            <AlertCircle className="text-amber-500" size={32} />
            <div>
              <h3 className="text-amber-800 font-bold">No tienes asignaciones en esta estación</h3>
              <p className="text-amber-700 text-xs mt-1">Si crees que esto es un error, contacta al equipo de soporte.</p>
            </div>
          </div>
        )}

        {/* Tabs de Grupo Académico */}
        {visibleGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
            {visibleGroups.map((group) => (
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
        )}

        {/* Tabs de Atelier */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit shadow-inner border border-slate-200">
          {visibleAteliers.map((atelier) => (
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
          <option value="pending_comments">Comentarios Pendientes</option>
          <option value="consolidated">Consolidan (≥ 3.7)</option>
          <option value="not_consolidated">No Consolidan (&lt; 3.7)</option>
          <option value="no_grades">Sin Notas</option>
        </select>

        {isSupport && (
          <select 
            value={filterGrower}
            onChange={(e) => setFilterGrower(e.target.value)}
            className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los Growers</option>
            {filterOptions.growers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}

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
                    <th key={s.id} className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800 min-w-[120px] relative group/header">
                      <div className="flex flex-col gap-1">
                        <span>{s.name}</span>
                        {assignments.some(a => a.subject_id === s.id) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/header:block z-50">
                            <div className="bg-slate-800 text-white text-[9px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 font-medium normal-case">
                              <div className="flex items-center gap-1.5 mb-1 border-b border-slate-700 pb-1">
                                <Users className="w-3 h-3 text-indigo-400" />
                                <span className="font-bold uppercase tracking-tighter">Growers Asignados</span>
                              </div>
                              {Array.from(new Set(assignments.filter(a => a.subject_id === s.id).map(a => a.grower_name))).map(name => (
                                <div key={name} className="flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                  {name}
                                </div>
                              ))}
                            </div>
                            <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700" />
                          </div>
                        )}
                        <Users className="w-3 h-3 mx-auto text-slate-600 group-hover/header:text-indigo-400 transition-colors cursor-help" />
                      </div>
                    </th>
                  ))}
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800 bg-indigo-900">Promedio</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800">Sinc.</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map(student => {
                  const report = reports.find(r => r.student_id === student.id);
                  return (
                    <tr key={student.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors group ${student.isCritical ? 'bg-red-50/30' : ''}`}>
                      <td className={`p-4 font-bold sticky left-0 z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)] ${student.isCritical ? 'bg-red-50 text-red-700 group-hover:bg-red-100' : 'bg-white text-slate-700 group-hover:bg-slate-50'}`}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span>{student.full_name}</span>
                            {student.isCritical && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-full animate-pulse uppercase">
                                Crítico
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium ${student.isCritical ? 'text-red-400' : 'text-slate-400'}`}>{student.document}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center border-l border-slate-50">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">{student.grade}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase">{student.atelier}</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase">{student.academic_level}</span>
                        </div>
                      </td>
                      <td className={`p-4 text-center border-l border-slate-50 ${student.isCritical ? 'bg-red-50/50' : ''}`}>
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`text-[9px] font-bold uppercase ${student.isCritical ? 'text-red-600' : 'text-slate-500'}`}>Inicio: {student.start_date || '—'}</span>
                          <span className={`text-[9px] font-bold uppercase ${student.isCritical ? 'text-red-700' : 'text-slate-500'}`}>Cierre: {student.end_date || '—'}</span>
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
                        const studentGrower = student.assignedGrowersBySubject?.[subject.id];

                        return (
                          <td key={subject.id} className="p-2 text-center border-l border-slate-50 relative group/cell">
                            {studentGrower && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50">
                                <div className="bg-slate-800 text-white text-[9px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 font-medium normal-case">
                                  <div className="flex items-center gap-1.5 mb-1 border-b border-slate-700 pb-1">
                                    <Users className="w-3 h-3 text-indigo-400" />
                                    <span className="font-bold uppercase tracking-tighter">Grower Asignado</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    {studentGrower.name}
                                  </div>
                                </div>
                                <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700" />
                              </div>
                            )}
                            {isSupport ? (
                              <div className="relative group/input">
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
