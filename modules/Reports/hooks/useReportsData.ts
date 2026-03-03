
import { useState, useEffect, useMemo } from 'react';
import { useGrading } from '../../../hooks/useGrading';
import { getStudentComments } from '../../../services/api';
import { Student, StudentComment, Station, Subject } from '../../../types';

export const useReportsData = () => {
  const grading = useGrading({ subjectFilter: false });
  const [allComments, setAllComments] = useState<StudentComment[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  useEffect(() => {
    if (grading.schoolYear && selectedStations.length === 0) {
      setSelectedStations(grading.schoolYear.stations.map(s => s.id));
    }
  }, [grading.schoolYear]);

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

  // Helper para obtener el código de curso del estudiante (Nivel-Sufijo)
  const getStudentCourseCode = (student: Student) => {
    const atelierName = (student.atelier || '').toLowerCase();
    let suffix = 'C';
    if (atelierName.includes('alhambra')) suffix = 'A';
    else if (atelierName.includes('mandalay')) suffix = 'MS';
    else if (atelierName.includes('mónaco') || atelierName.includes('monaco')) suffix = 'M';
    else if (atelierName.includes('casa')) suffix = 'C';

    return `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;
  };

  // Validaciones en tiempo real para la pestaña de Estación
  const validationResults = useMemo(() => {
    // 0. Filtrar estudiantes que estuvieron activos durante esta estación
    const activeInStation = grading.filteredStudents.filter(student => {
      if (!grading.currentStation) return true;
      
      const stationStart = new Date(grading.currentStation.startDate);
      const stationEnd = new Date(grading.currentStation.endDate);
      
      // Si no hay fechas en el record, asumimos que está activo (para no ocultar por error)
      if (!student.start_date) return true;
      
      const studentStart = new Date(student.start_date);
      const studentEnd = student.end_date ? new Date(student.end_date) : null;
      
      // El estudiante debe haber empezado antes de que termine la estación
      const startedBeforeEnd = studentStart <= stationEnd;
      // Y si terminó, debe haber sido después de que empezara la estación
      const endedAfterStart = !studentEnd || studentEnd >= stationStart;
      
      return startedBeforeEnd && endedAfterStart;
    });

    const results = activeInStation.map(student => {
      // 1. Obtener materias que le corresponden al estudiante por su nivel y atelier
      const studentCourseCode = getStudentCourseCode(student);
      const studentSubjects = grading.currentStation?.subjects.filter(subject => {
        const allowedCourses = subject.courses || [];
        if (allowedCourses.length === 0) return true; // Materia global
        return allowedCourses.some(course => course.trim().toUpperCase() === studentCourseCode);
      }) || [];

      // 2. Calcular slots de notas esperados para sus materias
      let expectedSlots = 0;
      studentSubjects.forEach(sub => {
        grading.currentStation?.moments.forEach(m => {
          m.sections.forEach(s => {
            expectedSlots += (s.gradeSlots?.length || 0);
          });
        });
      });

      // 3. Validar Notas (100% llenas en sus materias)
      const studentGrades = grading.grades?.filter((g) => g.studentId === student.id) || [];
      const relevantGrades = studentGrades.filter(g => studentSubjects.some(s => s.id === g.subjectId));
      const gradesComplete = expectedSlots > 0 && relevantGrades.length >= expectedSlots;

      // 4. Validar al menos una habilidad por asignatura vista
      const studentSkills = grading.skillSelections?.filter(s => s.studentId === student.id) || [];
      const skillsComplete = studentSubjects.length > 0 && studentSubjects.every(sub => 
        studentSkills.some(sk => sk.subjectId === sub.id)
      );

      // 5. Validar Comentarios (Habilidades y Convivencia)
      const comment = allComments.find(c => c.studentId === student.id);
      
      const hasConvivencia = !!comment?.comentary && comment.comentary.length > 10;
      const hasAcademic = !!comment?.academicCons && !!comment?.academicNon;
      const hasEmotional = !!comment?.emotionalSkills && !!comment?.talents;
      const hasSocial = !!comment?.socialInteraction && !!comment?.challenges;
      const hasLearningCrop = !!comment?.learning_crop_desc;

      const commentsFilled = hasConvivencia && hasAcademic && hasEmotional && hasSocial && hasLearningCrop;
      const commentsApproved = comment?.comentaryStatus === 'approved';

      // 6. Paz y Salvo Real
      const isPazYSalvo = student.paz_y_salvo?.toLowerCase().includes('ok') || 
                         student.paz_y_salvo?.toLowerCase().includes('si') || 
                         student.paz_y_salvo === 'Sí';

      // 7. Estación Cerrada
      const now = new Date();
      const stationEndDate = grading.currentStation ? new Date(grading.currentStation.endDate) : new Date();
      const stationClosed = now > stationEndDate;

      // Progreso ponderado: 40% notas, 30% habilidades, 30% comentarios
      let progress = 0;
      let gradesProgress = 0;
      if (expectedSlots > 0) {
        gradesProgress = (relevantGrades.length / expectedSlots);
        progress += gradesProgress * 40;
      }
      
      let skillsProgress = 0;
      if (studentSubjects.length > 0) {
        const skillsCount = studentSubjects.filter(sub => studentSkills.some(sk => sk.subjectId === sub.id)).length;
        skillsProgress = (skillsCount / studentSubjects.length);
        progress += skillsProgress * 30;
      }
      
      if (commentsFilled) progress += 30;

      const isApto = gradesComplete && skillsComplete && commentsApproved && commentsFilled && isPazYSalvo && stationClosed;

      return {
        student,
        validations: {
          grades_complete: gradesComplete,
          skills_complete: skillsComplete,
          comments_approved: commentsApproved && commentsFilled,
          paz_y_salvo: isPazYSalvo,
          station_closed: stationClosed
        },
        canSend: isApto,
        progress: Math.min(100, Math.round(progress))
      };
    });

    if (showIncompleteOnly) {
      return results.filter(r => !r.canSend);
    }

    return results;
  }, [grading.filteredStudents, grading.currentStation, allComments, grading.grades, grading.skillSelections, showIncompleteOnly]);

  return {
    ...grading,
    isLoading: grading.isLoading || isDataLoading,
    validationResults,
    allComments,
    showIncompleteOnly,
    setShowIncompleteOnly,
    selectedStations,
    setSelectedStations,
    fetchYearStudentData: grading.fetchYearStudentData
  };
};
