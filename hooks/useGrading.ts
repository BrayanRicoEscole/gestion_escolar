
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
  getStudents,
  getGrades,
  getSkillSelections,
  getLevelingGrades,
  saveLevelingGrades,
  saveGrades,
  saveSkillSelections
} from '../services/api'
import { supabase } from '../services/api/client'

export const useGrading = (options: { realtime?: boolean, subjectFilter?: boolean } = {}) => {
  const { realtime = false, subjectFilter = true } = options;
  
  const [isLoading, setIsLoading] = useState(true)
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

  // Referencias para canales
  const gradesChannelRef = useRef<any>(null);
  const levelingChannelRef = useRef<any>(null);

  // Carga Inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.info("[DB] 📥 Cargando estado inicial...");
        const [sy, st, gr, sk, lv] = await Promise.all([
          getSchoolYear(),
          getStudents(),
          getGrades(),
          getSkillSelections(),
          getLevelingGrades()
        ])

        setSchoolYear(sy)
        setStudents(st)
        setGrades(gr)
        setSkillSelections(sk || [])
        setLevelingGrades(lv || [])

        if (sy?.stations?.length) {
          const station = sy.stations[0]
          setSelectedStationId(station.id)
          if (station.subjects?.length) {
            setSelectedSubjectId(station.subjects[0].id)
          }
        }
      } catch (e) {
        console.error('[DB] ❌ Error en carga inicial:', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Estación y Materia Actual
  const currentStation = useMemo(() => 
    schoolYear?.stations.find(s => s.id === selectedStationId)
  , [schoolYear, selectedStationId]);

  const currentSubject = useMemo(() => 
    currentStation?.subjects?.find(s => s.id === selectedSubjectId)
  , [currentStation, selectedSubjectId]);

  // Suscripciones Realtime (Broadcast) - Condicional
  useEffect(() => {
    if (!realtime || !selectedSubjectId || !selectedStationId) return

    const gradesChannelId = `room:grades:${selectedSubjectId}`
    const levelingChannelId = `room:leveling:${selectedStationId}:${selectedSubjectId}`

    console.group(`[REALTIME] 📡 Iniciando Suscripción de Canales`);
    console.log(`Materia: ${selectedSubjectId}`);
    console.log(`Estación: ${selectedStationId}`);
    console.groupEnd();

    if (gradesChannelRef.current) supabase.removeChannel(gradesChannelRef.current);
    if (levelingChannelRef.current) supabase.removeChannel(levelingChannelRef.current);

    const gradesChannel = supabase.channel(gradesChannelId, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'grade_change' }, ({ payload }) => {
        const mapped: GradeEntry = {
          studentId: payload.studentId,
          slotId: payload.slotId,
          subjectId: payload.subjectId,
          value: payload.value
        }
        setGrades(prev => {
          const rest = prev.filter(g => !(g.studentId === mapped.studentId && g.slotId === mapped.slotId && g.subjectId === mapped.subjectId));
          return [...rest, mapped];
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`%c[REALTIME] 🟢 CONECTADO: ${gradesChannelId}`, "color: #10b981; font-weight: bold;");
        }
      });

    const levelingChannel = supabase.channel(levelingChannelId, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'leveling_change' }, ({ payload }) => {
        const mapped: LevelingGrade = {
          studentId: payload.studentId,
          subjectId: payload.subjectId,
          stationId: payload.stationId,
          value: payload.value
        }
        setLevelingGrades(prev => {
          const rest = prev.filter(l => !(l.studentId === mapped.studentId && l.subjectId === mapped.subjectId && l.stationId === mapped.stationId));
          return [...rest, mapped];
        });
      })
      .subscribe();

    gradesChannelRef.current = gradesChannel;
    levelingChannelRef.current = levelingChannel;

    return () => {
      if (gradesChannel) supabase.removeChannel(gradesChannel);
      if (levelingChannel) supabase.removeChannel(levelingChannel);
    }
  }, [selectedSubjectId, selectedStationId, realtime])

  // Filtrado de Estudiantes
  const filteredStudents = useMemo(() => {
    if (subjectFilter && !currentSubject) return [];

    return students.filter(student => {
      const modality = student.modality || '';
      const isSede = modality === 'RS' || modality.includes('Sede') || modality.includes('(RS)');
      const suffix = isSede ? 'M' : 'C';
      const studentCourseCode = `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
      
      // Filtro por materia opcional
      if (subjectFilter && currentSubject) {
        const allowedCourses = currentSubject.courses || [];
        const belongsToSubject = allowedCourses.some(course => 
          course.trim().toUpperCase() === studentCourseCode
        );
        if (!belongsToSubject) return false;
      }

      const matchesSearch = !searchTerm || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.document.includes(searchTerm);
      
      const matchesAtelier = selectedAtelier === 'all' || student.atelier === selectedAtelier;
      const matchesModality = selectedModality === 'all' || student.modality === selectedModality;
      const matchesAcademicLevel = selectedAcademicLevel === 'all' || student.academic_level === selectedAcademicLevel;
      
      let matchesCourseSelection = true;
      if (selectedCourse) {
        matchesCourseSelection = studentCourseCode === selectedCourse.trim().toUpperCase();
      }
      
      return matchesSearch && matchesAtelier && matchesModality && matchesAcademicLevel && matchesCourseSelection;
    });
  }, [students, searchTerm, selectedCourse, selectedAtelier, selectedModality, selectedAcademicLevel, currentSubject, subjectFilter]);

  const handleGradeChange = async (studentId: string, slotId: string, subjectId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setGrades(prev => [
      ...prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId)),
      { studentId, slotId, subjectId, value: numValue }
    ]);

    setIsSaving(true);
    try {
      await saveGrades([{ studentId, slotId, subjectId, value: numValue }]);
      const channel = gradesChannelRef.current;
      if (channel && realtime) {
        await channel.send({
          type: 'broadcast',
          event: 'grade_change',
          payload: { studentId, slotId, subjectId, value: numValue }
        });
      }
    } catch (e) {
      console.error("[AUTOSAVE] Persistencia error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLevelingChange = async (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setLevelingGrades(prev => [
      ...prev.filter(l => !(l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId)),
      { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }
    ]);

    setIsSaving(true);
    try {
      await saveLevelingGrades([{ studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }]);
      const channel = levelingChannelRef.current;
      if (channel && realtime) {
        await channel.send({
          type: 'broadcast',
          event: 'leveling_change',
          payload: { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }
        });
      }
    } catch (e) {
      console.error("[AUTOSAVE] Nivelación error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const getGradeValue = (studentId: string, slotId: string, subjectId: string) => 
    grades.find(g => g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId)?.value?.toString() || '';

  const getLevelingValue = (studentId: string) => 
    levelingGrades.find(l => l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId)?.value?.toString() || '';

  const toggleSkillSelection = async (studentId: string, skillId: string) => {
    let next: SkillSelection[] = [];
    setSkillSelections(prev => {
      const exists = prev.find(s => s.studentId === studentId && s.skillId === skillId && s.subjectId === selectedSubjectId);
      next = exists 
        ? prev.filter(s => s !== exists) 
        : [...prev, { studentId, skillId, subjectId: selectedSubjectId, stationId: selectedStationId }];
      return next;
    });

    try {
      await saveSkillSelections(next, selectedSubjectId, selectedStationId);
    } catch (e) {
      console.error("[DB] Error habilidades:", e);
    }
  };

  const getSkillSelectionsForStudent = (studentId: string) => 
    skillSelections.filter(s => s.studentId === studentId && s.subjectId === selectedSubjectId).map(s => s.skillId);

  return {
    isLoading,
    schoolYear,
    currentStation,
    currentSubject,
    filteredStudents,
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
    isSaving,
    grades,
    skillSelections,
    handleGradeChange,
    handleLevelingChange,
    getGradeValue,
    getLevelingValue,
    toggleSkillSelection,
    getSkillSelectionsForStudent
  };
};
