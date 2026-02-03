import { useState, useMemo } from 'react'

import {Student } from 'types'

export const useStudentFilters = (students: Student[]) => {
  const [search, setSearch] = useState('');
  const [atelier, setAtelier] = useState('all');
  const [modality, setModality] = useState('all');
  const [grade, setGrade] = useState('all');

  const filtered = useMemo(() => {
    return students.filter(s =>
      (s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.document?.includes(search)) &&
      (atelier === 'all' || s.atelier === atelier) &&
      (modality === 'all' || s.modality === modality) &&
      (grade === 'all' || s.grade === grade)
    );
  }, [students, search, atelier, modality, grade]);

  return {
    filtered,
    filters: { search, atelier, modality, grade },
    setters: { setSearch, setAtelier, setModality, setGrade }
  };
};
