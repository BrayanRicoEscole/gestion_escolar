
import { useState, useEffect, useMemo } from 'react';
import { useGrading } from '../../../hooks/useGrading';
import { getStudentComments } from '../../../services/api';
import { Student, StudentComment, Station } from '../../../types';

export const useReportsData = () => {
  const grading = useGrading({ subjectFilter: false });
  const [allComments, setAllComments] = useState<StudentComment[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      if (grading.selectedStationId) {
        try {
          const comments = await getStudentComments(grading.selectedStationId);
          setAllComments(comments);
        } catch (e) {
          console.error("Error fetching comments for reports:", e);
        } finally {
          setIsDataLoading(false);
        }
      }
    };
    fetchComments();
  }, [grading.selectedStationId]);

  // Calcula el total de notas esperadas por estación
  const expectedSlotsCount = useMemo(() => {
    if (!grading.currentStation) return 0;
    let count = 0;
    grading.currentStation.moments.forEach(m => {
      m.sections.forEach(s => {
        count += (s.gradeSlots?.length || 0);
      });
    });
    return count;
  }, [grading.currentStation]);

  // Validaciones en tiempo real para la pestaña de Estación
  const validationResults = useMemo(() => {
    return grading.filteredStudents.map(student => {
      // 1. Validar Notas (100% llenas)
      const studentGrades = grading.grades?.filter((g) => g.studentId === student.id) || [];
      const gradesComplete = expectedSlotsCount > 0 && studentGrades.length >= expectedSlotsCount;

      // 2. Validar Comentarios
      const comment = allComments.find(c => c.studentId === student.id);
      const commentsApproved = comment?.comentaryStatus === 'approved';

      // 3. Paz y Salvo Real
      const isPazYSalvo = student.paz_y_salvo?.toLowerCase().includes('ok') || 
                         student.paz_y_salvo?.toLowerCase().includes('si') || 
                         student.paz_y_salvo === 'Sí';

      // 4. Estación Cerrada (Fecha actual > Fecha fin)
      const now = new Date();
      const stationEndDate = grading.currentStation ? new Date(grading.currentStation.endDate) : new Date();
      const stationClosed = now > stationEndDate;

      return {
        student,
        validations: {
          grades_complete: gradesComplete,
          comments_approved: commentsApproved,
          paz_y_salvo: isPazYSalvo,
          station_closed: stationClosed
        },
        canSend: gradesComplete && commentsApproved && isPazYSalvo && stationClosed,
        progress: expectedSlotsCount > 0 ? (studentGrades.length / expectedSlotsCount) * 100 : 0
      };
    });
  }, [grading.filteredStudents, grading.currentStation, allComments, expectedSlotsCount, grading.grades]);

  return {
    ...grading,
    isLoading: grading.isLoading || isDataLoading,
    validationResults,
    allComments,
    expectedSlotsCount
  };
};
