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

    // 2. Filter upcoming endings
    const upcoming = records.filter((r: any) => {
      try {
        const d = new Date(r.end_date);
        return d >= today && d <= thirtyDaysFromNow;
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

        if (upcoming.length > 0) {
          const title = '📅 Cierres de Periodo Próximos';
          if (!existing?.some(n => n.title === title)) {
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: `Hay ${upcoming.length} estudiantes que finalizan su periodo académico en los próximos 30 días.`,
              type: 'info',
              link: '/academic_records'
            });
          }
        }
        if (pendingReports.length > 0) {
          const title = '⚠️ Reportes Finales Pendientes';
          if (!existing?.some(n => n.title === title)) {
            await notificationsApi.createNotification({
              user_id: user.id,
              title,
              message: `Hay ${pendingReports.length} reportes finales pendientes por enviar para estudiantes que están por cerrar su periodo.`,
              type: 'warning',
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

    // 4. Get current user profile to find role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const isSupport = myProfile?.role === 'support';
    const isGrower = myProfile?.role === 'grower';
    
    // 5. Get grower assignments to notify specific growers
    const { data: assignments } = await supabase.from('grower_assignments').select('*');

    // 6. For each active station, check pending grades
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
      const supportPendingList: { studentName: string, count: number }[] = [];

      for (const student of students) {
        const relevantSubjects = station.subjects.filter(subject => 
          isSubjectRelevant(student, subject)
        );

        let studentPendingCount = 0;

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
            
            // Check if this pending grade belongs to the current grower
            const assignment = assignments?.find(a => 
              a.grower_id === user.id &&
              a.subject_id === subject.id && 
              a.station_id === station.id &&
              a.academic_level === student.academic_level &&
              a.atelier === student.atelier &&
              a.course === studentCourseCode
            );

            if (assignment) {
              growerPendingList.push({
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

      // Notify Current User if Grower
      if (isGrower && growerPendingList.length > 0) {
        const uniqueStudents = new Set(growerPendingList.map(p => p.studentName)).size;
        const title = '⚠️ Notas Pendientes';
        
        // Check for existing recent notifications
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', title)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!existing || existing.length === 0) {
          await notificationsApi.createNotification({
            user_id: user.id,
            title,
            message: `Tienes notas pendientes para ${uniqueStudents} estudiantes en la estación ${station.name}. Por favor revisa el módulo de calificaciones.`,
            type: 'warning',
            link: '/grading'
          });
        }
      }

      // Notify Current User if Support (Summary)
      if (isSupport && supportPendingList.length > 0) {
        const totalPending = supportPendingList.length;
        const title = '📊 Reporte de Notas Pendientes';
        
        // Check for existing recent notifications
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', title)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (!existing || existing.length === 0) {
          await notificationsApi.createNotification({
            user_id: user.id,
            title,
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
