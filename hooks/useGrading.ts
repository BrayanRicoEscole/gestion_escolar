
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
  getSchoolYearsList
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
  const [selectedModality, setSelectedModality] = useState('all')
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState('all')

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const gradesChannelRef = useRef<any>(null);
  const levelingChannelRef = useRef<any>(null);

  // 1. Carga inicial de años y datos globales (grades, skills)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [years, gr, sk, lv] = await Promise.all([
          getSchoolYearsList(),
          getGrades(),
          getSkillSelections(),
          getLevelingGrades()
        ]);
        
        setAllYears(years);
        setGrades(gr);
        setSkillSelections(sk || []);
        setLevelingGrades(lv || []);

        if (years.length > 0) {
          setSelectedYearId(years[0].id);
        }
      } catch (e) {
        console.error('[DB] ❌ Error en carga base:', e);
      }
    };
    fetchInitial();
  }, []);

  // 2. Al cambiar el año seleccionado, cargar estructura Y estudiantes matriculados
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

  const currentSubject = useMemo(() => 
    currentStation?.subjects?.find(s => s.id === selectedSubjectId)
  , [currentStation, selectedSubjectId]);

  // Bulk Import
  const bulkImportGradesAndSkills = async (data: { gradeEntries: GradeEntry[], skillSelections: SkillSelection[] }) => {
    if (!selectedSubjectId || !selectedStationId) return;
    setIsSaving(true);
    try {
      const gradesToSave = data.gradeEntries.map(g => ({ ...g, subjectId: selectedSubjectId }));
      await saveGrades(gradesToSave);
      await saveSkillSelections(
        data.skillSelections.map(s => ({ ...s, subjectId: selectedSubjectId })), 
        selectedSubjectId, 
        selectedStationId
      );
      const [newGrades, newSkills] = await Promise.all([getGrades(), getSkillSelections()]);
      setGrades(newGrades);
      setSkillSelections(newSkills);
      return true;
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
    return students.filter(student => {
      const modality = student.modality || '';
      const isSede = modality === 'RS' || modality.includes('Sede') || modality.includes('(RS)');
      const suffix = isSede ? 'M' : 'C';
      const studentCourseCode = `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
      if (subjectFilter && currentSubject) {
        const allowedCourses = currentSubject.courses || [];
        if (!allowedCourses.some(course => course.trim().toUpperCase() === studentCourseCode)) return false;
      }
      const matchesSearch = !searchTerm || student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || student.document.includes(searchTerm);
      const matchesAtelier = selectedAtelier === 'all' || student.atelier === selectedAtelier;
      const matchesModality = selectedModality === 'all' || student.modality === selectedModality;
      const matchesAcademicLevel = selectedAcademicLevel === 'all' || student.academic_level === selectedAcademicLevel;
      let matchesCourseSelection = true;
      if (selectedCourse) matchesCourseSelection = studentCourseCode === selectedCourse.trim().toUpperCase();
      return matchesSearch && matchesAtelier && matchesModality && matchesAcademicLevel && matchesCourseSelection;
    });
  }, [students, searchTerm, selectedCourse, selectedAtelier, selectedModality, selectedAcademicLevel, currentSubject, subjectFilter]);

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
    filteredStudents, selectedStationId, setSelectedStationId, selectedSubjectId, setSelectedSubjectId,
    selectedCourse, setSelectedCourse, selectedAtelier, setSelectedAtelier, selectedModality, setSelectedModality,
    selectedAcademicLevel, setSelectedAcademicLevel, searchTerm, setSearchTerm, isSaving, grades, skillSelections,
    handleGradeChange, handleLevelingChange, getGradeValue, getLevelingValue, toggleSkillSelection, getSkillSelectionsForStudent,
    bulkImportGradesAndSkills
  };
};
