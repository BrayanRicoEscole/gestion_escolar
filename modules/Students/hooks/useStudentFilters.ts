import { useState, useMemo } from 'react'

import {Student } from 'types'

export const useStudentFilters = (students: Student[]) => {
  const [search, setSearch] = useState('');
  const [atelier, setAtelier] = useState('all');
  const [atelierType, setAtelierType] = useState('all');
  const [grade, setGrade] = useState('all');

  const filtered = useMemo(() => {
    const result = students.filter(s =>
      (s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.document?.includes(search)) &&
      (atelier === 'all' || s.atelier === atelier) &&
      (atelierType === 'all' || s.modality === atelierType) &&
      (grade === 'all' || s.grade === grade)
    );

    // Ordenar por Nivel Académico (Grupo Académico) y luego por Nombre
    return result.sort((a, b) => {
      const levelA = a.academic_level || '';
      const levelB = b.academic_level || '';
      if (levelA !== levelB) {
        return levelA.localeCompare(levelB);
      }
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
  }, [students, search, atelier, atelierType, grade]);

  return {
    filtered,
    filters: { search, atelier, atelierType, grade },
    setters: { setSearch, setAtelier, setAtelierType, setGrade }
  };
};
