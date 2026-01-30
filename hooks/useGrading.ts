import { useState, useEffect, useMemo } from 'react';
import { SchoolYear, Student, GradeEntry, SkillSelection } from '../types';
import { api } from '../services/api';

export const useGrading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [skillSelections, setSkillSelections] = useState<SkillSelection[]>([]);
  
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sy, st, gr, sk] = await Promise.all([
          api.getSchoolYear(),
          api.getStudents(),
          api.getGrades(),
          api.getSkillSelections()
        ]);
        
        setSchoolYear(sy);
        setStudents(st);
        setGrades(gr);
        setSkillSelections(sk || []);
        
        if (sy && sy.stations && sy.stations.length > 0) {
          const active = sy.stations[0];
          setSelectedStationId(active.id);
          if (active.subjects && active.subjects.length > 0) {
            setSelectedSubjectId(active.subjects[0].id);
            if (active.subjects[0].courses && active.subjects[0].courses.length > 0) {
              setSelectedCourse(active.subjects[0].courses[0]);
            }
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

  const filteredStudents = useMemo(() => 
    students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  , [students, searchTerm]);

  const handleGradeChange = (studentId: string, slotId: string, subjectId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId));
      return [...filtered, { studentId, slotId, subjectId, value: numValue }];
    });
  };

  const getGradeValue = (studentId: string, slotId: string, subjectId: string): string => {
    const entry = grades.find(g => g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId);
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
    setIsSaving(true);
    try {
      await Promise.all([
        api.saveGrades(grades),
        api.saveSkillSelections(skillSelections)
      ]);
      setIsSaving(false);
      return true;
    } catch (e) {
      console.error("Error saving data:", e);
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
    searchTerm,
    setSearchTerm,
    isSaving,
    handleGradeChange,
    getGradeValue,
    toggleSkillSelection,
    getSkillSelectionsForStudent,
    saveGrades
  };
};