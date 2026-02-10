
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

export const useGrading = () => {
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

  // Suscripciones Realtime (Broadcast)
  useEffect(() => {
    if (!selectedSubjectId || !selectedStationId) return

    const gradesChannelId = `room:grades:${selectedSubjectId}`
    const levelingChannelId = `room:leveling:${selectedStationId}:${selectedSubjectId}`

    console.log(`[REALTIME] 📡 Iniciando Suscripción de Canales`);
    console.log(`Materia: ${selectedSubjectId}`);
    console.log(`Estación: ${selectedStationId}`);
   

    // Eliminar canales previos si existen para evitar fugas de memoria o duplicados
    if (gradesChannelRef.current) supabase.removeChannel(gradesChannelRef.current);
    if (levelingChannelRef.current) supabase.removeChannel(levelingChannelRef.current);

    // Canal de Notas
    const gradesChannel = supabase.channel(gradesChannelId, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'grade_change' }, ({ payload }) => {
        console.log(`[REALTIME] 📥 NOTA RECIBIDA de otro cliente:`, payload);
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
          console.log(`%c[REALTIME] 🟢 CONECTADO AL CANAL DE NOTAS: ${gradesChannelId}`, "color: #10b981; font-weight: bold;");
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error(`%c[REALTIME] 🔴 FALLO EN CANAL DE NOTAS: ${status}`, "color: #f43f5e; font-weight: bold;");
        } else {
          console.log(`[REALTIME] Canal Notas Estado: ${status}`);
        }
      });

    // Canal de Nivelaciones
    const levelingChannel = supabase.channel(levelingChannelId, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'leveling_change' }, ({ payload }) => {
        console.info(`[REALTIME] 📥 NIVELACIÓN RECIBIDA:`, payload);
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`%c[REALTIME] 🟢 CONECTADO AL CANAL DE NIVELACIONES: ${levelingChannelId}`, "color: #10b981; font-weight: bold;");
        } else {
          console.log(`[REALTIME] Canal Nivelación Estado: ${status}`);
        }
      });

    gradesChannelRef.current = gradesChannel;
    levelingChannelRef.current = levelingChannel;

    return () => {
      console.warn(`[REALTIME] 🔌 Desconectando canales: ${selectedSubjectId}`);
      supabase.removeChannel(gradesChannel);
      supabase.removeChannel(levelingChannel);
    }
  }, [selectedSubjectId, selectedStationId])

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.document.includes(searchTerm);
      
      const matchesAtelier = selectedAtelier === 'all' || student.atelier === selectedAtelier;
      const matchesModality = selectedModality === 'all' || student.modality === selectedModality;
      const matchesAcademicLevel = selectedAcademicLevel === 'all' || student.academic_level === selectedAcademicLevel;
      
      let matchesCourse = true;
      if (selectedCourse) {
        const [level, suffix] = selectedCourse.split('-');
        const modality = suffix === 'M' ? 'RS' : 'RC';
        matchesCourse = student.academic_level === level && student.modality === modality;
      }
      
      return matchesSearch && matchesAtelier && matchesModality && matchesAcademicLevel && matchesCourse;
    });
  }, [students, searchTerm, selectedCourse, selectedAtelier, selectedModality, selectedAcademicLevel]);

  const handleGradeChange = async (studentId: string, slotId: string, subjectId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    // 1. Optimistic Update (UI)
    setGrades(prev => [
      ...prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId)),
      { studentId, slotId, subjectId, value: numValue }
    ]);

    // 2. Persistencia
    setIsSaving(true);
    try {
      await saveGrades([{ studentId, slotId, subjectId, value: numValue }]);

      // 3. Broadcast con Validación de Canal
      const channel = gradesChannelRef.current;
      if (channel) {
        const state = channel.state;
        if (state === 'joined') {
          console.log(`[REALTIME] 📣 EMITIENDO BROADCAST (Nota: ${numValue})`);
          await channel.send({
            type: 'broadcast',
            event: 'grade_change',
            payload: { studentId, slotId, subjectId, value: numValue }
          });
        } else {
          console.error(`[REALTIME] 🔴 ERROR: El canal no está en estado JOINED (Estado actual: ${state}). El broadcast no se envió.`);
        }
      } else {
        console.error("[REALTIME] 🔴 ERROR: El objeto canal es nulo. No se puede emitir broadcast.");
      }
    } catch (e) {
      console.error("[AUTOSAVE] ❌ Error en persistencia:", e);
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
      if (channel && channel.state === 'joined') {
        console.log(`[REALTIME] 📣 EMITIENDO BROADCAST (Nivelación: ${numValue})`);
        await channel.send({
          type: 'broadcast',
          event: 'leveling_change',
          payload: { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }
        });
      }
    } catch (e) {
      console.error("[AUTOSAVE] ❌ Error en nivelación:", e);
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

  const currentStation = useMemo(() => schoolYear?.stations.find(s => s.id === selectedStationId), [schoolYear, selectedStationId]);

  return {
    isLoading,
    schoolYear,
    currentStation,
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
