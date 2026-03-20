
import { useState, useEffect, useMemo } from 'react';
import { useGrading } from '../../../hooks/useGrading';
import { getAllUserProfiles } from '../../../services/api/users.api';
import { getGrowerAssignments } from '../../../services/api/growerAssignments.api';
import { getStudentComments } from '../../../services/api/comments.api';
import { getGrades } from '../../../services/api/grades.api';
import { getSkillSelections } from '../../../services/api/skills.api';
import { GrowerAssignment, UserProfile, Student, GradeEntry, StudentComment, SkillSelection } from '../../../types';

const ACADEMIC_GROUPS = [
  { id: 'Petiné', name: 'Petiné', levels: ['C', 'D'] },
  { id: 'Elementary', name: 'Elementary', levels: ['E', 'F', 'G', 'H'] },
  { id: 'Middle', name: 'Middle', levels: ['I', 'J', 'K'] },
  { id: 'Highschool', name: 'Highschool', levels: ['L', 'M', 'N'] },
];

export interface GrowerStatus {
  grower: UserProfile;
  assignments: {
    assignment: GrowerAssignment;
    totalStudents: number;
    gradedStudents: number;
    pendingStudents: string[]; // Names of pending students
    progress: number;
  }[];
  overallProgress: number;
  isComplete: boolean;
}

export const useGrowerStatus = () => {
  const grading = useGrading({ subjectFilter: false });
  const [allGrowers, setAllGrowers] = useState<UserProfile[]>([]);
  const [allAssignments, setAllAssignments] = useState<GrowerAssignment[]>([]);
  const [allComments, setAllComments] = useState<StudentComment[]>([]);
  const [stationGrades, setStationGrades] = useState<GradeEntry[]>([]);
  const [stationSkills, setStationSkills] = useState<SkillSelection[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!grading.selectedStationId) return;
      
      setIsLocalLoading(true);
      try {
        const subjectIds = grading.currentStation?.subjects.map(s => s.id) || [];
        
        const [profiles, assignments, comments, grades, skills] = await Promise.all([
          getAllUserProfiles(),
          getGrowerAssignments(),
          getStudentComments(grading.selectedStationId),
          getGrades(subjectIds, []), // Fetch grades for station subjects
          getSkillSelections(subjectIds, []) // Fetch skills for station subjects
        ]);
        
        setAllGrowers(profiles.filter(p => p.role === 'grower'));
        setAllAssignments(assignments.filter(a => a.station_id === grading.selectedStationId));
        setAllComments(comments);
        setStationGrades(grades);
        setStationSkills(skills.filter(s => s.stationId === grading.selectedStationId));
      } catch (e) {
        console.error("Error fetching grower status data:", e);
      } finally {
        setIsLocalLoading(false);
      }
    };
    
    fetchData();
  }, [grading.selectedStationId]);

  const getStudentCourseCode = (student: Student) => {
    const atelierName = (student.atelier || '').toLowerCase();
    let suffix = 'C';
    if (atelierName.includes('alhambra')) suffix = 'A';
    else if (atelierName.includes('mandalay')) suffix = 'MS';
    else if (atelierName.includes('mónaco') || atelierName.includes('monaco')) suffix = 'M';
    else if (atelierName.includes('casa')) suffix = 'C';

    const cleanedLevel = (student.academic_level || '').trim().toUpperCase().match(/^[A-Z][0-9]*/)?.[0] || '';
    return `${cleanedLevel}-${suffix}`;
  };

  const growerStatuses = useMemo(() => {
    if (!grading.currentStation || allGrowers.length === 0) return [];

    const station = grading.currentStation;
    const students = grading.students;
    const grades = stationGrades;
    const skills = stationSkills;
    const comments = allComments;

    // Calculate expected slots per subject in this station
    const subjectExpectedSlots: Record<string, number> = {};
    station.subjects.forEach(sub => {
      let slots = 0;
      station.moments.forEach(m => {
        m.sections.forEach(s => {
          slots += (s.gradeSlots?.length || 0);
        });
      });
      subjectExpectedSlots[sub.id] = slots;
    });

    return allGrowers.map(grower => {
      const growerAssignments = allAssignments.filter(a => a.grower_id === grower.id);
      
      const assignmentDetails = growerAssignments.map(assignment => {
        // Find students for this assignment
        const assignedStudents = students.filter(student => {
          const studentCourseCode = getStudentCourseCode(student);
          const studentLevel = (student.academic_level || '').trim().toUpperCase();
          const cleanedLevel = studentLevel.match(/^[A-Z][0-9]*/)?.[0] || '';
          const baseLevelChar = cleanedLevel.charAt(0);

          const aLevelLower = (assignment.academic_level || '').toLowerCase().trim();
          const aAtelierLower = (assignment.atelier || '').toLowerCase().trim();
          const aCourseLower = (assignment.course || '').toLowerCase().trim();

          // Level matching
          let levelMatch = false;
          if (!assignment.academic_level || aLevelLower === 'todos' || aLevelLower === 'all') {
            levelMatch = true;
          } else if (aLevelLower === cleanedLevel.toLowerCase()) {
            levelMatch = true;
          } else {
            // Check if it's an academic group
            const group = ACADEMIC_GROUPS.find(g => g.id.toLowerCase() === aLevelLower);
            if (group) {
              levelMatch = group.levels.some(l => cleanedLevel.startsWith(l));
            } else if (assignment.academic_level.length === 1 && assignment.academic_level.toUpperCase() === baseLevelChar) {
              levelMatch = true;
            }
          }

          // Atelier matching
          const atelierMatch = !assignment.atelier || aAtelierLower === 'todos' || aAtelierLower === 'all' || 
                             (student.atelier && student.atelier.toLowerCase().includes(aAtelierLower));

          // Course matching
          const courseMatch = !assignment.course || aCourseLower === 'todos' || aCourseLower === 'all' || 
                            aCourseLower === studentCourseCode.toLowerCase() ||
                            studentCourseCode.toLowerCase().startsWith(aCourseLower);

          return levelMatch && atelierMatch && courseMatch;
        });

        if (growerAssignments.length > 0 && assignedStudents.length === 0) {
          console.warn(`Grower ${grower.full_name} has assignment ${assignment.subject_name} but no students matched.`, {
            assignment,
            studentSample: students.slice(0, 5).map(s => ({ level: s.academic_level, atelier: s.atelier, course: getStudentCourseCode(s) }))
          });
        }

        const expectedSlotsPerStudent = subjectExpectedSlots[assignment.subject_id] || 0;
        
        let gradedCount = 0;
        const pendingStudents: string[] = [];

        assignedStudents.forEach(student => {
          // Check grades
          const studentGrades = grades.filter(g => 
            g.studentId === student.id && 
            g.subjectId === assignment.subject_id
          );
          
          const hasAllGrades = expectedSlotsPerStudent === 0 || studentGrades.length >= expectedSlotsPerStudent;
          
          // Check skills (at least one skill selected for the subject/station)
          const hasSkills = skills.some(s => 
            s.studentId === student.id && 
            s.subjectId === assignment.subject_id
          );

          // Check comment
          const studentComment = comments.find(c => c.studentId === student.id);
          
          const hasConvivencia = !!studentComment?.comentary && studentComment.comentary.length > 10;
          const hasAcademic = !!studentComment?.academicCons && !!studentComment?.academicNon;
          const hasEmotional = !!studentComment?.emotionalSkills && !!studentComment?.talents;
          const hasSocial = !!studentComment?.socialInteraction && !!studentComment?.challenges;
          const hasLearningCrop = !!studentComment?.learning_crop_desc;
          
          const commentsFilled = hasConvivencia && hasAcademic && hasEmotional && hasSocial && hasLearningCrop;
          const hasComment = !!studentComment && commentsFilled && studentComment.comentaryStatus === 'approved';

          if (hasAllGrades && hasSkills && hasComment) {
            gradedCount++;
          } else {
            const reasons = [];
            if (!hasAllGrades) reasons.push('notas');
            if (!hasSkills) reasons.push('habilidades');
            if (!hasComment) {
              if (!studentComment) reasons.push('sin comentario');
              else if (!commentsFilled) {
                const missing = [];
                if (!hasConvivencia) missing.push('convivencia');
                if (!hasAcademic) missing.push('académico');
                if (!hasEmotional) missing.push('emocional');
                if (!hasSocial) missing.push('social');
                if (!hasLearningCrop) missing.push('cosecha');
                reasons.push(`comentario incompleto (${missing.join(', ')})`);
              }
              else if (studentComment.comentaryStatus !== 'approved') reasons.push(`comentario ${studentComment.comentaryStatus || 'pendiente'}`);
            }
            pendingStudents.push(`${student.full_name} (${reasons.join(', ')})`);
          }
        });

        const progress = assignedStudents.length > 0 
          ? (gradedCount / assignedStudents.length) * 100 
          : (growerAssignments.length > 0 ? 0 : 100);

        return {
          assignment,
          totalStudents: assignedStudents.length,
          gradedStudents: gradedCount,
          pendingStudents,
          progress
        };
      });

      const overallProgress = assignmentDetails.length > 0
        ? assignmentDetails.reduce((acc, curr) => acc + curr.progress, 0) / assignmentDetails.length
        : 100;

      return {
        grower,
        assignments: assignmentDetails,
        overallProgress: Math.round(overallProgress),
        isComplete: overallProgress === 100
      };
    }).sort((a, b) => a.overallProgress - b.overallProgress);
  }, [allGrowers, allAssignments, grading.currentStation, grading.students, stationGrades, stationSkills, allComments]);

  const filteredGrowerStatuses = useMemo(() => {
    if (!grading.searchTerm) return growerStatuses;
    
    const term = grading.searchTerm.toLowerCase();
    return growerStatuses.filter(status => {
      const growerMatch = status.grower.full_name.toLowerCase().includes(term);
      const assignmentMatch = status.assignments.some(a => 
        a.assignment.subject_name.toLowerCase().includes(term) ||
        a.pendingStudents.some(s => s.toLowerCase().includes(term))
      );
      return growerMatch || assignmentMatch;
    });
  }, [growerStatuses, grading.searchTerm]);

  return {
    ...grading,
    isLoading: grading.isLoading || isLocalLoading,
    growerStatuses: filteredGrowerStatuses
  };
};
