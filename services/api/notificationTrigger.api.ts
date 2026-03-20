import { supabase } from './client';
import { notificationsApi } from './notifications.api';
import { getAllUserProfiles } from './users.api';
import { getSchoolYear, isSubjectRelevant, getSchoolYearsList } from './schoolYear.api';
import { getGrades } from './grades.api';
import { Subject } from '../../types';

export const notificationTriggerApi = {
  async checkAndNotifyAcademicAlerts() {
    console.log('[DEBUG:Notifications] Starting check for academic alerts...');
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 1. Fetch academic records with student info
    const { data: records, error } = await supabase
      .from('student_academic_records')
      .select(`
        id,
        end_date,
        final_report_sent,
        students:student_id (full_name)
      `)
      .not('end_date', 'is', null);

    if (error || !records) {
      console.error('[DEBUG:Notifications] Error fetching academic records:', error);
      return;
    }

    // 2. Filter upcoming endings and past due pending reports
    const upcoming = records.filter((r: any) => {
      try {
        const d = new Date(r.end_date);
        // Upcoming: ends in next 30 days
        const isUpcoming = d >= today && d <= thirtyDaysFromNow;
        // Past and pending: ended in the past but report not sent
        const isPastAndPending = d < today && !r.final_report_sent;
        return isUpcoming || isPastAndPending;
      } catch {
        return false;
      }
    });

    // 3. Filter pending reports
    const pendingReports = upcoming.filter((r: any) => !r.final_report_sent);

    // 4. Notify Current User if Support
    if (upcoming.length > 0 || pendingReports.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (myProfile?.role === 'support') {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        // Check for existing recent notifications to avoid spam
        const { data: existing } = await supabase
          .from('notifications')
          .select('id, title')
          .eq('user_id', user.id)
          .gt('created_at', yesterday.toISOString());

        const upcomingEndings = upcoming.filter((r: any) => new Date(r.end_date) >= today);

        if (upcomingEndings.length > 0) {
          const title = '📅 Próximos Cierres de Año Escolar';
          if (!existing?.some(n => n.title === title)) {
            const names = upcomingEndings.slice(0, 3).map((r: any) => r.students?.full_name).join(', ');
            const more = upcomingEndings.length > 3 ? ` y ${upcomingEndings.length - 3} más` : '';
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: `Estudiantes que finalizan su año escolar pronto: ${names}${more}. Total: ${upcomingEndings.length}.`,
              type: 'info',
              link: '/academic_records'
            });
          }
        }
        if (pendingReports.length > 0) {
          const title = '⚠️ Reportes de Año Pendientes (Vencidos)';
          if (!existing?.some(n => n.title === title)) {
            const names = pendingReports.slice(0, 3).map((r: any) => r.students?.full_name).join(', ');
            const more = pendingReports.length > 3 ? ` y ${pendingReports.length - 3} más` : '';
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: `Reportes finales de año pendientes para estudiantes con fecha de cierre vencida: ${names}${more}. Total: ${pendingReports.length}.`,
              type: 'error',
              link: '/academic_records'
            });
          }
        }
      }
    }
    
    console.log('[DEBUG:Notifications] Academic alerts check completed.');
  },

  async checkAndNotifyPendingGrades() {
    console.log('[DEBUG:Notifications] Starting check for pending grades...');
    
    // Also check academic alerts
    await this.checkAndNotifyAcademicAlerts();
    // 1. Get current school year
    let schoolYears;
    try {
      schoolYears = await getSchoolYearsList();
    } catch (syError) {
      console.log('[DEBUG:Notifications] Error fetching school years list. Skipping pending grades check.', syError);
      return;
    }
      
    if (!schoolYears || schoolYears.length === 0) {
      console.log('[DEBUG:Notifications] No school year found. Skipping pending grades check.');
      return;
    }
    
    const schoolYear = await getSchoolYear(schoolYears[0].id);
    if (!schoolYear) return;

    // 2. Identify closing stations (closing in next 15 days or already closed)
    const now = new Date();
    const activeStations = schoolYear.stations.filter(station => {
      const endDate = new Date(station.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // We check stations that are closing in the next 15 days OR ANY station that has already closed
      return diffDays <= 15;
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

    // 4. Get current user profile to find role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const isSupport = myProfile?.role === 'support';
    const isGrower = myProfile?.role === 'grower';
    
    // 5. Get grower assignments and comments
    const { data: assignments } = await supabase.from('grower_assignments').select(`
      *,
      profiles:grower_id(full_name)
    `);
    const { data: comments } = await supabase.from('student_comments').select('*');

    // 6. For each active station, check pending grades and comments
    for (const station of activeStations) {
      console.log(`[DEBUG:Notifications] Checking station: ${station.name}`);
      
      // Get all slot IDs for this station to filter grades correctly
      const stationSlotIds = new Set(station.moments.flatMap(m => 
        m.sections.flatMap(sec => 
          sec.gradeSlots.map(slot => slot.id)
        )
      ));

      const subjectIds = station.subjects.map(s => s.id);
      const studentIds = students.map(s => s.id);

      // Fetch grades for these subjects and students
      const allGrades = await getGrades(subjectIds, studentIds);
      
      // Filter grades that belong to this station's slots
      const stationGrades = allGrades.filter(g => stationSlotIds.has(g.slotId));
      
      // Group pending
      const growerPendingList: { studentName: string, subjectName: string }[] = [];
      const supportPendingGrades: { studentName: string, count: number, growers: string[] }[] = [];
      const supportPendingComments: { studentName: string, growers: string[] }[] = [];

      for (const student of students) {
        const relevantSubjects = station.subjects.filter(subject => 
          isSubjectRelevant(student, subject)
        );

        let studentPendingCount = 0;
        let studentPendingGrowers = new Set<string>();

        // Calculate student course code for assignment matching
        const atelierName = (student.atelier || '').toLowerCase();
        let suffix = 'C';
        if (atelierName.includes('alhambra')) suffix = 'A';
        else if (atelierName.includes('mandalay')) suffix = 'MS';
        else if (atelierName.includes('mónaco') || atelierName.includes('monaco')) suffix = 'M';
        else if (atelierName.includes('casa')) suffix = 'C';
        const studentCourseCode = `${(student.academic_level || '').trim().toUpperCase()}-${suffix}`;

        for (const subject of relevantSubjects) {
          const studentGrades = stationGrades.filter(g => g.studentId === student.id && g.subjectId === subject.id);
          const hasGrades = studentGrades.some(g => g.value !== null);
          
          if (!hasGrades) {
            studentPendingCount++;
            
            // Find assigned grower
            const assignment = assignments?.find(a => 
              a.subject_id === subject.id && 
              a.station_id === station.id &&
              a.academic_level === student.academic_level &&
              a.atelier === student.atelier &&
              a.course === studentCourseCode
            );

            if (assignment) {
              studentPendingGrowers.add(assignment.profiles?.full_name || 'Sin asignar');
              if (assignment.grower_id === user.id) {
                growerPendingList.push({
                  studentName: student.full_name,
                  subjectName: subject.name
                });
              }
            }
          }
        }

        if (studentPendingCount > 0) {
          supportPendingGrades.push({
            studentName: student.full_name,
            count: studentPendingCount,
            growers: Array.from(studentPendingGrowers)
          });
        }

        // Check comments
        const studentComment = comments?.find(c => c.student_id === student.id && c.station_id === station.id);
        const hasPendingComments = !studentComment || !studentComment.academic_cons || !studentComment.academic_non || !studentComment.emotional_skills;
        
        if (hasPendingComments) {
          const levelAssignments = assignments?.filter(a => 
            a.station_id === station.id &&
            a.academic_level === student.academic_level &&
            a.atelier === student.atelier &&
            a.course === studentCourseCode
          ) || [];
          
          const commentGrowers = Array.from(new Set(levelAssignments.map(a => a.profiles?.full_name || 'Sin asignar')));
          supportPendingComments.push({
            studentName: student.full_name,
            growers: commentGrowers
          });

          if (levelAssignments.some(a => a.grower_id === user.id)) {
            // Add to grower pending list if not already there (maybe with a flag for comment)
            // For now let's just use the same list or a separate one
          }
        }
      }

      const isStationClosed = new Date(station.endDate) < new Date();

      // Notify Current User if Grower
      if (isGrower && growerPendingList.length > 0) {
        const uniqueStudents = Array.from(new Set(growerPendingList.map(p => p.studentName)));
        const title = isStationClosed ? '🚨 CRÍTICO: Estación Cerrada con Pendientes' : '⚠️ Notas de Estación Pendientes';
        const type = isStationClosed ? 'error' : 'warning';
        
        // Check for existing recent notifications
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', title)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!existing || existing.length === 0) {
          const names = uniqueStudents.slice(0, 3).join(', ');
          const more = uniqueStudents.length > 3 ? ` y ${uniqueStudents.length - 3} más` : '';
          await notificationsApi.createNotification({
            user_id: user.id,
            title,
            message: isStationClosed 
              ? `La estación ${station.name} ya cerró y aún tienes notas pendientes para: ${names}${more}.`
              : `Tienes notas pendientes para: ${names}${more}. Total: ${uniqueStudents.length} estudiantes en ${station.name}.`,
            type,
            link: '/grading'
          });
        }
      }

      // Notify Current User if Support (Summary)
      if (isSupport) {
        if (supportPendingGrades.length > 0) {
          const title = isStationClosed ? '🚨 REPORTE CRÍTICO: Notas de Estación Pendientes' : '📊 Reporte de Notas de Estación Pendientes';
          const type = isStationClosed ? 'error' : 'info';
          
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', title)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          if (!existing || existing.length === 0) {
            const growerNames = Array.from(new Set(supportPendingGrades.flatMap(p => p.growers))).slice(0, 3).join(', ');
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: isStationClosed
                ? `¡ALERTA! La estación ${station.name} cerró con ${supportPendingGrades.length} estudiantes con notas incompletas. Growers: ${growerNames}...`
                : `Hay ${supportPendingGrades.length} estudiantes con notas pendientes en ${station.name}. Growers con pendientes: ${growerNames}...`,
              type,
              link: '/station_reports'
            });
          }
        }

        if (supportPendingComments.length > 0) {
          const title = isStationClosed ? '🚨 REPORTE CRÍTICO: Comentarios de Estación Pendientes' : '💬 Reporte de Comentarios de Estación Pendientes';
          const type = isStationClosed ? 'error' : 'warning';
          
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', title)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          if (!existing || existing.length === 0) {
            const growerNames = Array.from(new Set(supportPendingComments.flatMap(p => p.growers))).slice(0, 3).join(', ');
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: isStationClosed
                ? `¡ALERTA! La estación ${station.name} cerró con ${supportPendingComments.length} estudiantes con comentarios incompletos. Growers: ${growerNames}...`
                : `Hay ${supportPendingComments.length} estudiantes con comentarios pendientes en ${station.name}. Growers responsables: ${growerNames}...`,
              type,
              link: '/station_reports'
            });
          }
        }
      }
    }
    
    console.log('[DEBUG:Notifications] Notification check completed.');
  }
};
