import { useState, useMemo } from 'react'

import {Student } from 'types'

export const useStudentFilters = (students: Student[]) => {
  const [search, setSearch] = useState('');
  const [atelier, setAtelier] = useState('all');
  const [calendario, setCalendario] = useState('all');
  const [grade, setGrade] = useState('all');
  const [academicLevel, setAcademicLevel] = useState('all');
  const [tl, setTl] = useState('all');
  const [showMissingFields, setShowMissingFields] = useState(false);

  const filtered = useMemo(() => {
    const result = students.filter(s => {
      const matchesSearch = (s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.document?.includes(search));
      const matchesAtelier = (atelier === 'all' || s.atelier === atelier);
      const matchesCalendario = (calendario === 'all' || s.calendario === calendario);
      const matchesGrade = (grade === 'all' || s.grade === grade);
      const matchesAcademicLevel = (academicLevel === 'all' || s.academic_level === academicLevel);
      const matchesTl = (tl === 'all' || s.tl === tl);

      let matchesMissingFields = true;
      if (showMissingFields) {
        // Definir campos importantes que podrían faltar
        const importantFields: (keyof Student)[] = [
          'academic_level', 'grade', 'atelier', 'modality', 'calendario',
          'tl', 'cuenta_institucional', 'nacimiento', 'rh', 'acudiente_academico',
          'telefono_a', 'correo_a', 'acudiente_financiero', 'telefono_financiero'
        ];
        matchesMissingFields = importantFields.some(field => !s[field]);
      }

      return matchesSearch && matchesAtelier && matchesCalendario && matchesGrade && matchesAcademicLevel && matchesTl && matchesMissingFields;
    });

    // Ordenar por Nivel Académico (Grupo Académico) y luego por Nombre
    return result.sort((a, b) => {
      const levelA = a.academic_level || '';
      const levelB = b.academic_level || '';
      if (levelA !== levelB) {
        return levelA.localeCompare(levelB);
      }
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
  }, [students, search, atelier, calendario, grade, academicLevel, tl, showMissingFields]);

  return {
    filtered,
    filters: { search, atelier, calendario, grade, academicLevel, tl, showMissingFields },
    setters: { setSearch, setAtelier, setCalendario, setGrade, setAcademicLevel, setTl, setShowMissingFields }
  };
};
