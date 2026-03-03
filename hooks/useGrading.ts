import { useState, useEffect, useMemo, useRef } from 'react'
import {
  SchoolYear,
  Student,
  GradeEntry,
  SkillSelection,
  LevelingGrade
} from '../types'
import {
  getSchoolYear,
  getEnrolledStudents,
  getGrades,
  getSkillSelections,
  getLevelingGrades,
  saveLevelingGrades,
  saveGrades,
  saveSkillSelections,
  getSchoolYearsList,
  processDeepGradesImport,
  copyStationData
} from '../services/api'
import { supabase } from '../services/api/client'

export const useGrading = (options: { realtime?: boolean, subjectFilter?: boolean } = {}) => {
  const { realtime = false, subjectFilter = true } = options;
  
  const [isLoading, setIsLoading] = useState(true)
  const [allYears, setAllYears] = useState<{id: string, name: string}[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null)
  
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [levelingGrades, setLevelingGrades] = useState<LevelingGrade[]>([])
  const [skillSelections, setSkillSelections] = useState<SkillSelection[]>([])

  const [selectedStationId, setSelectedStationId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')

  const [selectedAtelier, setSelectedAtelier] = useState('all')
  const [selectedAtelierType, setSelectedAtelierType] = useState('all')
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState('all')
  const [selectedCalendar, setSelectedCalendar] = useState('all')
  const [selectedLevelGroup, setSelectedLevelGroup] = useState<'Petiné' | 'Elementary' | 'Middle' | 'Highschool'>('Petiné');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const gradesChannelRef = useRef<any>(null);
  const levelingChannelRef = useRef<any>(null);

  

  // 1. Carga inicial de años
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const years = await getSchoolYearsList();
        setAllYears(years);
        if (years.length > 0) {
          setSelectedYearId(years[0].id);
        }
      } catch (e) {
        console.error('[DB] ❌ Error en carga inicial:', e);
      }
    };
    fetchInitial();
  }, []);

  // 2. Carga de estructura y estudiantes al cambiar año
  useEffect(() => {
    if (!selectedYearId) return;
    const fetchYearData = async () => {
      setIsLoading(true);
      try {
        const [sy, st] = await Promise.all([
          getSchoolYear(selectedYearId),
          getEnrolledStudents(selectedYearId)
        ]);
        
        setSchoolYear(sy);
        setStudents(st);

        if (sy?.stations?.length) {
          const station = sy.stations[0];
          setSelectedStationId(station.id);
          if (station.subjects?.length) setSelectedSubjectId(station.subjects[0].id);
          else setSelectedSubjectId('');
        }
      } catch (e) {
        console.error('[DB] ❌ Error cargando año:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchYearData();
  }, [selectedYearId]);

  const currentStation = useMemo(() => 
    schoolYear?.stations.find(s => s.id === selectedStationId)
  , [schoolYear, selectedStationId]);

  const filteredSubjects = useMemo(() => {
    if (!currentStation?.subjects) return [];
    
    const groupLevels = {
      'Petiné': ['C'],
      'Elementary': ['D', 'E', 'F', 'G'],
      'Middle': ['H', 'I', 'J', 'K'],
      'Highschool': ['L', 'M', 'N']
    }[selectedLevelGroup];

    return currentStation.subjects.filter(subject => {
      const subCourses = subject.courses || [];
      if (subCourses.length === 0) return true; // Materias globales

      return subCourses.some(course => {
        const levelChar = course.charAt(0).toUpperCase();
        return groupLevels.includes(levelChar);
      });
    });
  }, [currentStation, selectedLevelGroup]);

  // Auto-seleccionar materia válida al cambiar de grupo de nivel
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const isCurrentValid = filteredSubjects.some(s => s.id === selectedSubjectId);
      if (!isCurrentValid) {
        setSelectedSubjectId(filteredSubjects[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [filteredSubjects, selectedSubjectId]);

  const currentSubject = useMemo(() => 
    currentStation?.subjects?.find(s => s.id === selectedSubjectId)
  , [currentStation, selectedSubjectId]);

  /**
   * Ejecuta la importación profunda validando documentos
   */
  const bulkImportGradesAndSkills = async (rawRows: any[]) => {
    if (!selectedSubjectId || !selectedStationId || !selectedYearId) return;
    setIsSaving(true);
    try {
      const result = await processDeepGradesImport(
        rawRows,
        selectedYearId,
        selectedStationId,
        selectedSubjectId
      );

      // Refrescar lista de estudiantes (esto disparará el useEffect de carga de notas para la página actual)
      const newStudents = await getEnrolledStudents(selectedYearId);
      setStudents(newStudents);
      
      return result;
    } catch (err) {
      console.error("Error en importación masiva:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!realtime || !selectedSubjectId || !selectedStationId) return
    const gradesChannelId = `room:grades:${selectedSubjectId}`
    const levelingChannelId = `room:leveling:${selectedStationId}:${selectedSubjectId}`
    if (gradesChannelRef.current) supabase.removeChannel(gradesChannelRef.current);
    if (levelingChannelRef.current) supabase.removeChannel(levelingChannelRef.current);
    const gradesChannel = supabase.channel(gradesChannelId, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'grade_change' }, ({ payload }) => {
        const mapped: GradeEntry = { studentId: payload.studentId, slotId: payload.slotId, subjectId: payload.subjectId, value: payload.value }
        setGrades(prev => [...prev.filter(g => !(g.studentId === mapped.studentId && g.slotId === mapped.slotId && g.subjectId === mapped.subjectId)), mapped]);
      }).subscribe();
    const levelingChannel = supabase.channel(levelingChannelId, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'leveling_change' }, ({ payload }) => {
        const mapped: LevelingGrade = { studentId: payload.studentId, subjectId: payload.subjectId, stationId: payload.stationId, value: payload.value }
        setLevelingGrades(prev => [...prev.filter(l => !(l.studentId === mapped.studentId && l.subjectId === mapped.subjectId && l.stationId === mapped.stationId)), mapped]);
      }).subscribe();
    gradesChannelRef.current = gradesChannel;
    levelingChannelRef.current = levelingChannel;
    return () => { if (gradesChannel) supabase.removeChannel(gradesChannel); if (levelingChannel) supabase.removeChannel(levelingChannel); }
  }, [selectedSubjectId, selectedStationId, realtime])

  const filteredStudents = useMemo(() => {
    if (subjectFilter && !currentSubject) return [];
    const result = students.filter(student => {
      const atelierName = (student.atelier || '').toLowerCase();
      let suffix = 'C';
      if (atelierName.includes('alhambra')) suffix = 'A';
      else if (atelierName.includes('mandalay')) suffix = 'MS';
      else if (atelierName.includes('mónaco') || atelierName.includes('monaco')) suffix = 'M';
      else if (atelierName.includes('casa')) suffix = 'C';

      const studentCourseCode = `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
      if (subjectFilter && currentSubject) {
        const allowedCourses = currentSubject.courses || [];
        if (!allowedCourses.some(course => course.trim().toUpperCase() === studentCourseCode)) return false;
      }
      const matchesSearch = !searchTerm || student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || student.document.includes(searchTerm);
      const matchesAtelier = selectedAtelier === 'all' || student.atelier === selectedAtelier;
      const matchesAtelierType = selectedAtelierType === 'all' || suffix === selectedAtelierType;
      const matchesAcademicLevel = selectedAcademicLevel === 'all' || student.academic_level === selectedAcademicLevel;
      const matchesCalendar = selectedCalendar === 'all' || (student.calendario || 'A') === selectedCalendar;
      
      let matchesLevelGroup = true;
      const groupLevels = {
        'Petiné': ['C'],
        'Elementary': ['D', 'E', 'F', 'G'],
        'Middle': ['H', 'I', 'J', 'K'],
        'Highschool': ['L', 'M', 'N']
      }[selectedLevelGroup];
      
      const levelChar = (student.academic_level || '').charAt(0).toUpperCase();
      matchesLevelGroup = groupLevels.includes(levelChar);

      let matchesCourseSelection = true;

      if (selectedCourse) matchesCourseSelection = studentCourseCode === selectedCourse.trim().toUpperCase();

      // Filtrado por fechas de la estación (Solo mostrar si estuvo activo durante la estación)
      let matchesStationPeriod = true;
      if (currentStation) {
        const sStart = student.start_date || '0000-01-01';
        const sEnd = student.end_date || '9999-12-31';
        const stStart = currentStation.startDate;
        const stEnd = currentStation.endDate;

        // El estudiante NO coincide si:
        // 1. Empezó después de que terminó la estación
        // 2. Se retiró antes de que empezara la estación
        if (sStart > stEnd || sEnd < stStart) {
          matchesStationPeriod = false;
        }
      }

      return matchesSearch && matchesAtelier && matchesAtelierType && matchesAcademicLevel && matchesCalendar && matchesLevelGroup && matchesCourseSelection && matchesStationPeriod;
    });

    // Ordenar por Nivel Académico y luego por Nombre
    return result.sort((a, b) => {
      const levelA = a.academic_level || '';
      const levelB = b.academic_level || '';
      if (levelA !== levelB) return levelA.localeCompare(levelB);
      return a.full_name.localeCompare(b.full_name);
    });
    
  }, [students, searchTerm, selectedCourse, selectedAtelier, selectedAtelierType, selectedAcademicLevel, selectedLevelGroup, currentSubject, subjectFilter]);

  const paginatedStudents = useMemo(() => {
    if (filteredStudents.length <= pageSize) return filteredStudents;
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const allSubjectIds = useMemo(() => {
    return currentStation?.subjects?.map(s => s.id) || [];
  }, [currentStation]);

  const allYearSubjectIds = useMemo(() => {
    const ids = new Set<string>();
    schoolYear?.stations.forEach(st => {
      st.subjects.forEach(sub => ids.add(sub.id));
    });
    return Array.from(ids);
  }, [schoolYear]);

  // 3. Carga de notas y habilidades al cambiar de materia/estación o grupo de nivel
  useEffect(() => {
    const targetSubjectIds = subjectFilter ? (selectedSubjectId ? [selectedSubjectId] : []) : allSubjectIds;
    
    if (targetSubjectIds.length === 0) {
      setGrades([]);
      setSkillSelections([]);
      setLevelingGrades([]);
      return;
    }

    const fetchSubjectData = async () => {
      try {
        // Solo cargar datos para los estudiantes visibles en la página actual
        const studentIds = paginatedStudents.map(s => s.id || '');
        
        // Si no hay estudiantes en esta página, no tiene sentido consultar
        if (studentIds.length === 0) {
          setGrades([]);
          setSkillSelections([]);
          setLevelingGrades([]);
          return;
        }

        const [gr, sk, lv] = await Promise.all([
          getGrades(targetSubjectIds, studentIds),
          getSkillSelections(targetSubjectIds, studentIds),
          getLevelingGrades(targetSubjectIds, studentIds)
        ]);

        setGrades(gr);
        setSkillSelections(sk || []);
        setLevelingGrades(lv || []);
      } catch (e) {
        console.error('[DB] ❌ Error cargando datos de materia:', e);
      }
    };

    fetchSubjectData();
  }, [selectedSubjectId, selectedStationId, paginatedStudents, subjectFilter, allSubjectIds]);

  /**
   * Carga datos específicos para un estudiante (útil para previsualizaciones)
   */
  const fetchStudentData = async (studentId: string) => {
    const targetSubjectIds = subjectFilter ? (selectedSubjectId ? [selectedSubjectId] : []) : allSubjectIds;
    if (targetSubjectIds.length === 0) return;

    try {
      const [gr, sk, lv] = await Promise.all([
        getGrades(targetSubjectIds, [studentId]),
        getSkillSelections(targetSubjectIds, [studentId]),
        getLevelingGrades(targetSubjectIds, [studentId])
      ]);

      // Mezclar con los datos existentes evitando duplicados
      setGrades(prev => {
        const otherStudents = prev.filter(g => g.studentId !== studentId);
        return [...otherStudents, ...gr];
      });
      setSkillSelections(prev => {
        const otherStudents = prev.filter(s => s.studentId !== studentId);
        return [...otherStudents, ...(sk || [])];
      });
      setLevelingGrades(prev => {
        const otherStudents = prev.filter(l => l.studentId !== studentId);
        return [...otherStudents, ...(lv || [])];
      });
    } catch (e) {
      console.error('[DB] ❌ Error cargando datos individuales:', e);
    }
  };

  const fetchYearStudentData = async (studentId: string) => {
    if (allYearSubjectIds.length === 0) return;

    try {
      const [gr, sk, lv] = await Promise.all([
        getGrades(allYearSubjectIds, [studentId]),
        getSkillSelections(allYearSubjectIds, [studentId]),
        getLevelingGrades(allYearSubjectIds, [studentId])
      ]);

      setGrades(prev => {
        const otherStudents = prev.filter(g => g.studentId !== studentId);
        return [...otherStudents, ...gr];
      });
      setSkillSelections(prev => {
        const otherStudents = prev.filter(s => s.studentId !== studentId);
        return [...otherStudents, ...(sk || [])];
      });
      setLevelingGrades(prev => {
        const otherStudents = prev.filter(l => l.studentId !== studentId);
        return [...otherStudents, ...(lv || [])];
      });
    } catch (e) {
      console.error('[DB] ❌ Error cargando datos anuales del estudiante:', e);
    }
  };

  const handleCopyStationData = async (sourceStationId: string) => {
    if (!selectedStationId || !selectedSubjectId || !selectedYearId) return;
    setIsSaving(true);
    try {
      const result = await copyStationData(
        sourceStationId,
        selectedStationId,
        selectedSubjectId,
        selectedYearId
      );
      
      if (result.success) {
        // Recargar datos
        const [sy, gr, sk, lv] = await Promise.all([
          getSchoolYear(selectedYearId),
          getGrades([selectedSubjectId], paginatedStudents.map(s => s.id || '')),
          getSkillSelections([selectedSubjectId], paginatedStudents.map(s => s.id || '')),
          getLevelingGrades([selectedSubjectId], paginatedStudents.map(s => s.id || ''))
        ]);
        setSchoolYear(sy);
        setGrades(gr);
        setSkillSelections(sk || []);
        setLevelingGrades(lv || []);
      }
      return result;
    } catch (err) {
      console.error("Error copiando datos de estación:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevelGroup, selectedAtelier, searchTerm, selectedCourse, selectedAtelierType, selectedAcademicLevel]);

  const handleGradeChange = async (studentId: string, slotId: string, subjectId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setGrades(prev => [...prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId)), { studentId, slotId, subjectId, value: numValue }]);
    setIsSaving(true);
    try {
      await saveGrades([{ studentId, slotId, subjectId, value: numValue }]);
      if (gradesChannelRef.current && realtime) {
        await gradesChannelRef.current.send({ type: 'broadcast', event: 'grade_change', payload: { studentId, slotId, subjectId, value: numValue } });
      }
    } catch (e) { console.error("[AUTOSAVE] Error:", e); } finally { setIsSaving(false); }
  };

  const handleLevelingChange = async (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setLevelingGrades(prev => [...prev.filter(l => !(l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId)), { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }]);
    setIsSaving(true);
    try {
      await saveLevelingGrades([{ studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }]);
      if (levelingChannelRef.current && realtime) {
        await levelingChannelRef.current.send({ type: 'broadcast', event: 'leveling_change', payload: { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue } });
      }
    } catch (e) { console.error("[AUTOSAVE] Error:", e); } finally { setIsSaving(false); }
  };

  const getGradeValue = (studentId: string, slotId: string, subjectId: string) => 
    grades.find(g => g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId)?.value?.toString() || '';

  const getLevelingValue = (studentId: string) => 
    levelingGrades.find(l => l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId)?.value?.toString() || '';

  const toggleSkillSelection = async (studentId: string, skillId: string) => {
    let next: SkillSelection[] = [];
    setSkillSelections(prev => {
      const exists = prev.find(s => s.studentId === studentId && s.skillId === skillId && s.subjectId === selectedSubjectId);
      next = exists ? prev.filter(s => s !== exists) : [...prev, { studentId, skillId, subjectId: selectedSubjectId, stationId: selectedStationId }];
      return next;
    });
    try { await saveSkillSelections(next, selectedSubjectId, selectedStationId); } catch (e) { console.error("[DB] Error habilidades:", e); }
  };

  const getSkillSelectionsForStudent = (studentId: string) => 
    skillSelections.filter(s => s.studentId === studentId && s.subjectId === selectedSubjectId).map(s => s.skillId);

  return {
    isLoading, allYears, selectedYearId, setSelectedYearId, schoolYear, currentStation, currentSubject,
    filteredSubjects,
    filteredStudents, paginatedStudents, totalStudents: filteredStudents.length, currentPage, setCurrentPage, pageSize, setPageSize,
    selectedStationId, setSelectedStationId, selectedSubjectId, setSelectedSubjectId,
    selectedCourse, setSelectedCourse, selectedAtelier, setSelectedAtelier, selectedAtelierType, setSelectedAtelierType,
    selectedAcademicLevel, setSelectedAcademicLevel, selectedCalendar, setSelectedCalendar, selectedLevelGroup, setSelectedLevelGroup, searchTerm, setSearchTerm, isSaving, grades, skillSelections,
    handleGradeChange, handleLevelingChange, getGradeValue, getLevelingValue, toggleSkillSelection, getSkillSelectionsForStudent,
    bulkImportGradesAndSkills, fetchStudentData, fetchYearStudentData, handleCopyStationData
  };
};