import { supabase } from './client';
import { notificationsApi } from './notifications.api';
import { getAllUserProfiles } from './users.api';
import { getSchoolYear, isSubjectRelevant } from './schoolYear.api';
import { getGrades } from './grades.api';
import { Subject } from '../../types';

export const notificationTriggerApi = {
  async checkAndNotifyPendingGrades() {
    console.log('[DEBUG:Notifications] Starting check for pending grades...');
    
    // 1. Get current school year
    const { data: schoolYears, error: syError } = await supabase
      .from('school_years')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (syError || !schoolYears || schoolYears.length === 0) {
      console.error('[DEBUG:Notifications] No school year found');
      return;
    }
    
    const schoolYear = await getSchoolYear(schoolYears[0].id);
    if (!schoolYear) return;

    // 2. Identify closing stations (closing in next 15 days or recently closed)
    const now = new Date();
    const activeStations = schoolYear.stations.filter(station => {
      const endDate = new Date(station.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // We check stations that are closing in the next 15 days OR closed in the last 5 days
      return diffDays <= 15 && diffDays >= -5;
    });

    if (activeStations.length === 0) {
      console.log('[DEBUG:Notifications] No stations closing soon.');
      return;
    }

    // 3. Get all active students
    const { data: students, error: stError } = await supabase
      .from('students')
      .select('*')
      .eq('estado_actual', 'Activo');
      
    if (stError || !students) {
      console.error('[DEBUG:Notifications] Error fetching students:', stError);
      return;
    }

    // 4. Get all profiles to find supports and growers
    const allProfiles = await getAllUserProfiles();
    const supports = allProfiles.filter(p => p.role === 'support');
    
    // 5. Get grower assignments to notify specific growers
    const { data: assignments } = await supabase.from('grower_assignments').select('*');

    // 6. For each active station, check pending grades
    for (const station of activeStations) {
      console.log(`[DEBUG:Notifications] Checking station: ${station.name}`);
      const grades = await getGrades(schoolYear.id, station.id);
      
      // Group pending by grower
      const growerPendingMap: Record<string, { studentName: string, subjectName: string }[]> = {};
      const supportPendingList: { studentName: string, count: number }[] = [];

      for (const student of students) {
        const relevantSubjects = station.subjects.filter(subject => 
          isSubjectRelevant(student, subject)
        );

        let studentPendingCount = 0;

        for (const subject of relevantSubjects) {
          const studentGrades = grades.filter(g => g.studentId === student.id && g.subjectId === subject.id);
          const hasGrades = studentGrades.some(g => g.value !== null);
          
          if (!hasGrades) {
            studentPendingCount++;
            
            // Find assigned grower for this subject/course/level
            const assignment = assignments?.find(a => 
              a.subject_id === subject.id && 
              a.station_id === station.id &&
              a.academic_level === student.academic_level &&
              a.atelier === student.atelier
            );

            if (assignment) {
              if (!growerPendingMap[assignment.grower_id]) {
                growerPendingMap[assignment.grower_id] = [];
              }
              growerPendingMap[assignment.grower_id].push({
                studentName: student.full_name,
                subjectName: subject.name
              });
            }
          }
        }

        if (studentPendingCount > 0) {
          supportPendingList.push({
            studentName: student.full_name,
            count: studentPendingCount
          });
        }
      }

      // Notify Growers
      for (const [growerId, pendings] of Object.entries(growerPendingMap)) {
        const uniqueStudents = new Set(pendings.map(p => p.studentName)).size;
        await notificationsApi.createNotification({
          user_id: growerId,
          title: '⚠️ Notas Pendientes',
          message: `Tienes notas pendientes para ${uniqueStudents} estudiantes en la estación ${station.name}. Por favor revisa el módulo de calificaciones.`,
          type: 'warning',
          link: '/grading'
        });
      }

      // Notify Supports (Summary)
      if (supportPendingList.length > 0) {
        const totalPending = supportPendingList.length;
        for (const support of supports) {
          await notificationsApi.createNotification({
            user_id: support.id,
            title: '📊 Reporte de Notas Pendientes',
            message: `Hay ${totalPending} estudiantes con notas pendientes en la estación ${station.name} que cierra el ${new Date(station.endDate).toLocaleDateString()}.`,
            type: 'info',
            link: '/station_reports'
          });
        }
      }
    }
    
    console.log('[DEBUG:Notifications] Notification check completed.');
  }
};
