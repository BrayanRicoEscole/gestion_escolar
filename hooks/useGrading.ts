
import { useState, useEffect, useMemo } from 'react';
import { SchoolYear, Student, GradeEntry, SkillSelection, LevelingGrade } from '../types';
import { api } from '../services/api';

export const useGrading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [levelingGrades, setLevelingGrades] = useState<LevelingGrade[]>([]);
  const [skillSelections, setSkillSelections] = useState<SkillSelection[]>([]);
  
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>(''); 
  
  const [selectedAtelier, setSelectedAtelier] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<string>('all');

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sy, st, gr, sk, lv] = await Promise.all([
          api.getSchoolYear(),
          api.getStudents(),
          api.getGrades(),
          api.getSkillSelections(),
          api.getLevelingGrades()
        ]);
        
        setSchoolYear(sy);
        setStudents(st);
        setGrades(gr);
        setSkillSelections(sk || []);
        setLevelingGrades(lv || []);
        
        if (sy && sy.stations && sy.stations.length > 0) {
          const active = sy.stations[0];
          setSelectedStationId(active.id);
          if (active.subjects && active.subjects.length > 0) {
            const firstSub = active.subjects[0];
            setSelectedSubjectId(firstSub.id);
            setSelectedCourse(''); 
          }
        }
      } catch (e) {
        console.error("Error fetching grading data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStation = useMemo(() => 
    schoolYear?.stations.find(s => s.id === selectedStationId)
  , [schoolYear, selectedStationId]);

  const currentSubject = useMemo(() => 
    currentStation?.subjects.find(s => s.id === selectedSubjectId)
  , [currentStation, selectedSubjectId]);

  useEffect(() => {
    if (currentSubject) {
      if (selectedCourse !== '' && (!currentSubject.courses || !currentSubject.courses.includes(selectedCourse))) {
        setSelectedCourse('');
      }
    }
  }, [selectedSubjectId, selectedStationId, currentSubject]);

  const filteredStudents = useMemo(() => {
    if (!currentSubject) return [];
    const subjectCourses = Array.isArray(currentSubject.courses) ? currentSubject.courses : [];
    
    return students.filter(s => {
      const level = s.academic_level || '';
      const modSuffix = s.modality === 'RS' ? 'M' : 'C';
      const studentCourseKey = `${level}-${modSuffix}`;
      
      const belongsToSubject = subjectCourses.includes(studentCourseKey);
      if (!belongsToSubject) return false;

      const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAtelier = selectedAtelier === 'all' || s.atelier === selectedAtelier;
      const matchesCourse = selectedCourse === '' || studentCourseKey === selectedCourse;
      const matchesModalityFilter = selectedModality === 'all' || s.modality === selectedModality;
      const matchesAcademicLevelFilter = selectedAcademicLevel === 'all' || s.academic_level === selectedAcademicLevel;
      
      return matchesSearch && matchesAtelier && matchesCourse && matchesModalityFilter && matchesAcademicLevelFilter;
    });
  }, [students, searchTerm, selectedAtelier, selectedModality, selectedAcademicLevel, selectedCourse, currentSubject]);

  const handleGradeChange = (studentId: string, slotId: string, subjectId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId));
      return [...filtered, { studentId, slotId, subjectId, value: numValue }];
    });
  };

  const handleLevelingChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setLevelingGrades(prev => {
      const filtered = prev.filter(l => !(l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId));
      return [...filtered, { studentId, subjectId: selectedSubjectId, stationId: selectedStationId, value: numValue }];
    });
  };

  const getGradeValue = (studentId: string, slotId: string, subjectId: string): string => {
    const entry = grades.find(g => g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId);
    return entry?.value?.toString() || '';
  };

  const getLevelingValue = (studentId: string): string => {
    const entry = levelingGrades.find(l => l.studentId === studentId && l.subjectId === selectedSubjectId && l.stationId === selectedStationId);
    return entry?.value?.toString() || '';
  };

  const toggleSkillSelection = (studentId: string, skillId: string) => {
    setSkillSelections(prev => {
      const exists = prev.find(s => s.studentId === studentId && s.skillId === skillId && s.subjectId === selectedSubjectId);
      if (exists) {
        return prev.filter(s => !(s.studentId === studentId && s.skillId === skillId && s.subjectId === selectedSubjectId));
      } else {
        return [...prev, { studentId, skillId, subjectId: selectedSubjectId, stationId: selectedStationId }];
      }
    });
  };

  const getSkillSelectionsForStudent = (studentId: string) => {
    return skillSelections
      .filter(s => s.studentId === studentId && s.subjectId === selectedSubjectId)
      .map(s => s.skillId);
  };

  const saveGrades = async () => {
    console.log("[useGrading] Iniciando guardado masivo de notas y habilidades...");
    setIsSaving(true);
    try {
      await Promise.all([
        api.saveGrades(grades),
        api.saveLevelingGrades(levelingGrades),
        api.saveSkillSelections(skillSelections, selectedSubjectId, selectedStationId)
      ]);
      console.log("[useGrading] Guardado masivo exitoso");
      setIsSaving(false);
      return true;
    } catch (e) {
      console.error("[useGrading] Error crítico al guardar datos:", e);
      setIsSaving(false);
      return false;
    }
  };

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
    handleGradeChange,
    handleLevelingChange,
    getGradeValue,
    getLevelingValue,
    toggleSkillSelection,
    getSkillSelectionsForStudent,
    saveGrades
  };
};
