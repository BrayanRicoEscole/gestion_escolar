
import { useState, useEffect } from 'react'
import { getActiveStudents } from '../../../services/api'
import { Student } from 'types'

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getActiveStudents();
      setStudents(data);
    } catch (e) {
      console.error("[useStudents] Error al cargar activos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, refetch: fetchStudents };
};
