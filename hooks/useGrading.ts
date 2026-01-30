
import { useState, useEffect, useMemo } from 'react';
import { SchoolYear, Student, GradeEntry } from '../types';
import { api } from '../services/api';

export const useGrading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [sy, st, gr] = await Promise.all([
        api.getSchoolYear(),
        api.getStudents(),
        api.getGrades()
      ]);
      
      setSchoolYear(sy);
      setStudents(st);
      setGrades(gr);
      
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
      setIsLoading(false);
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
      // Keep entries that are NOT for this specific student, slot AND subject
      const filtered = prev.filter(g => !(g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId));
      return [...filtered, { studentId, slotId, subjectId, value: numValue }];
    });
  };

  // Fixed: Updated to return string to ensure type compatibility with input components and avoid number vs string union errors
  const getGradeValue = (studentId: string, slotId: string, subjectId: string): string => {
    const entry = grades.find(g => g.studentId === studentId && g.slotId === slotId && g.subjectId === subjectId);
    if (!entry || entry.value === null || entry.value === undefined) return '';
    return entry.value.toString();
  };

  const saveGrades = async () => {
    setIsSaving(true);
    try {
      await api.saveGrades(grades);
      setIsSaving(false);
      return true;
    } catch (e) {
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
    saveGrades
  };
};
