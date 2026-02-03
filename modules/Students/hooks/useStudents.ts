import { useState, useEffect } from 'react'
import { getStudents } from '../../../services/api'
import {Student } from 'types'

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      setStudents(await getStudents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, refetch: fetchStudents };
};
