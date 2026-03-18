import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, UserCheck, UserX, CreditCard, Home, MapPin, 
  TrendingUp, BarChart3, PieChart, School, Loader2, ArrowUpRight, 
  CalendarDays, Info, AlertTriangle, ShieldAlert, Filter,
  LayoutGrid, List, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend,
  LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardData, DashboardData } from '../../services/api/dashboard.api';
import { getGrowerAssignments } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { notificationTriggerApi } from '../../services/api/notificationTrigger.api';
import { notificationsApi } from '../../services/api/notifications.api';
import { Notification, GrowerAssignment } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, Layers, MapPin as MapPinIcon, GraduationCap as GraduationCapIcon } from 'lucide-react';

type ChartType = 'bar' | 'pie';
type Dimension = 'modality' | 'grade' | 'atelier' | 'level' | 'year' | 'course';

export const DashboardModule: React.FC = () => {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRlsError, setIsRlsError] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);
  const [myAssignments, setMyAssignments] = useState<GrowerAssignment[]>([]);
  
  const isSupport = profile?.role === 'support';
  
  // Customization state
  const [activeDimension, setActiveDimension] = useState<Dimension>('modality');
  const [activeChartType, setActiveChartType] = useState<ChartType>('bar');

  // Global Filters
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterModality, setFilterModality] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');

  useEffect(() => {
    getDashboardData()
      .then(res => {
        setData(res);
        setError(null);
        setIsRlsError(false);
      })
      .catch(err => {
        console.error("[Dashboard] Error cargando datos:", err);
        if (err.code === '42P17' || err.message?.includes('recursion') || err.message?.includes('permission')) {
          setIsRlsError(true);
        } else {
          setError("No se pudieron cargar los datos estratégicos.");
        }
      })
      .finally(() => {
        setLoading(false);
      });

    if (profile?.id) {
      notificationsApi.getNotifications(profile.id).then(setNotifications);
      if (profile.role === 'grower') {
        getGrowerAssignments(profile.id).then(setMyAssignments);
      }
    }
  }, [profile?.id, profile?.role]);

  const handleManualCheck = async () => {
    setIsCheckingNotifications(true);
    try {
      await notificationTriggerApi.checkAndNotifyPendingGrades();
      if (profile?.id) {
        const updated = await notificationsApi.getNotifications(profile.id);
        setNotifications(updated);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    } finally {
      setIsCheckingNotifications(false);
    }
  };

  // Filtered Students Logic
  const filteredStudents = useMemo(() => {
    if (!data) return [];
    
    return data.students.filter(student => {
      // 1. Filter by Modality
      if (filterModality !== 'all' && student.modality !== filterModality) return false;
      
      // 2. Filter by Course (Grade)
      if (filterCourse !== 'all' && student.grade !== filterCourse) return false;
      
      // 3. Filter by Year
      if (filterYear !== 'all') {
        const studentYears = data.academicRecords
          .filter(r => r.student_id === student.id)
          .map(r => r.year_name);
        if (!studentYears.includes(filterYear)) return false;
      }
      
      return true;
    });
  }, [data, filterYear, filterModality, filterCourse]);

  // Derived Stats based on filtered students
  const stats = useMemo(() => {
    if (!data) return null;

    const active = filteredStudents.filter(s => s.estado_actual?.toLowerCase().includes('activo'));
    const retired = filteredStudents.filter(s => !s.estado_actual?.toLowerCase().includes('activo'));
    const pazYSalvoCount = active.filter(s => s.paz_y_salvo?.toLowerCase().includes('si') || s.paz_y_salvo?.toLowerCase().includes('ok')).length;

    // Aggregations for charts
    const modalityCounts = active.reduce((acc: any, s) => {
      const mod = s.modality === 'RS' ? 'Renfort Sede' : 'Renfort Casa';
      acc[mod] = (acc[mod] || 0) + 1;
      return acc;
    }, {});

    const gradeCounts = active.reduce((acc: any, s) => {
      const g = s.grade || 'Sin Grado';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    const atelierCounts = active.reduce((acc: any, s) => {
      const a = s.atelier || 'Por Asignar';
      acc[a] = (acc[a] || 0) + 1;
      return acc;
    }, {});

    const levelCounts = active.reduce((acc: any, s) => {
      const l = s.academic_level || 'Sin Nivel';
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {});

    // Year counts need to look at academic records for the filtered students
    const yearCounts = filteredStudents.reduce((acc: any, s) => {
      const studentYears = data.academicRecords
        .filter(r => r.student_id === s.id)
        .map(r => r.year_name);
      
      studentYears.forEach(y => {
        acc[y] = (acc[y] || 0) + 1;
      });
      return acc;
    }, {});

    // Academic Alerts
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingEndings = data.academicRecords.filter(r => {
      if (!r.end_date || r.end_date === 'N/A') return false;
      const d = new Date(r.end_date);
      return d >= today && d <= thirtyDaysFromNow;
    });

    const pendingFinalReports = upcomingEndings.filter(r => !r.final_report_sent);

    return {
      totalActive: active.length,
      totalRetired: retired.length,
      pazYSalvoCount,
      upcomingEndingsCount: upcomingEndings.length,
      pendingFinalReportsCount: pendingFinalReports.length,
      byModality: Object.entries(modalityCounts).map(([label, count]: [string, any]) => ({ label, count })),
      byGrade: Object.entries(gradeCounts).map(([label, count]: [string, any]) => ({ label: `Grado ${label}`, count })),
      byAtelier: Object.entries(atelierCounts).map(([label, count]: [string, any]) => ({ label, count })),
      byLevel: Object.entries(levelCounts).map(([label, count]: [string, any]) => ({ label, count })),
      byCourse: Object.entries(gradeCounts).map(([label, count]: [string, any]) => ({ label, count })),
      enrollmentByYear: Object.entries(yearCounts)
        .map(([yearName, count]: [string, any]) => ({ yearName, count }))
        .sort((a, b) => b.yearName.localeCompare(a.yearName))
    };
  }, [data, filteredStudents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 text-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Compilando indicadores de rendimiento...</p>
      </div>
    );
  }

  if (isRlsError) {
    return (
      <div className="p-12 max-w-3xl mx-auto mt-20">
        <Card className="border-rose-200 bg-rose-50/30 p-12 text-center text-black">
           <ShieldAlert size={64} className="text-rose-600 mx-auto mb-6" />
           <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Acceso de Datos Bloqueado</h3>
           <p className="text-slate-600 mb-8 font-medium">
             Tus políticas de seguridad (RLS) están impidiendo que el Dashboard consulte la tabla de estudiantes. 
             Esto suele deberse a la <strong>recursión infinita</strong> en la tabla de perfiles.
           </p>
           <div className="p-6 bg-white rounded-3xl border border-rose-100 text-left">
              <p className="text-[10px] font-black uppercase text-rose-600 mb-3">Cómo solucionarlo:</p>
              <ol className="text-xs text-slate-500 space-y-2 list-decimal ml-4 font-bold">
                 <li>Ve al módulo de <strong>Usuarios</strong>.</li>
                 <li>Copia el script SQL de "Corrección de RLS" que aparece en el aviso de error.</li>
                 <li>Pégalo y ejecútalo en el editor SQL de Supabase.</li>
              </ol>
           </div>
        </Card>
      </div>
    );
  }

  if (error || !data || !stats) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20">
        <Card className="border-amber-200 bg-amber-50/30 p-12 text-center text-black">
           <AlertTriangle size={48} className="text-amber-500 mx-auto mb-6" />
           <h3 className="text-xl font-black text-slate-900 mb-2">Panel sin Información</h3>
           <p className="text-slate-600 mb-8 font-medium">No hay registros de estudiantes para procesar estadísticas o hay un problema de conexión.</p>
           <div className="p-4 bg-white rounded-2xl border border-amber-100 text-left">
              <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Acción sugerida:</p>
              <p className="text-xs text-slate-500">Importa la base de datos de estudiantes en el módulo <strong>Estudiantes</strong>.</p>
           </div>
        </Card>
      </div>
    );
  }

  const retentionRate = (stats.totalActive + stats.totalRetired) > 0 
    ? Math.round((stats.totalActive / (stats.totalActive + stats.totalRetired)) * 100) 
    : 0;

  const pazYSalvoRate = stats.totalActive > 0 
    ? Math.round((stats.pazYSalvoCount / stats.totalActive) * 100) 
    : 0;

  const COLORS = ['#6366f1', '#f97316', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#eab308'];

  const getChartData = () => {
    switch (activeDimension) {
      case 'modality': return stats.byModality.map(d => ({ name: d.label, value: d.count }));
      case 'grade': return stats.byGrade.map(d => ({ name: d.label, value: d.count }));
      case 'atelier': return stats.byAtelier.map(d => ({ name: d.label, value: d.count }));
      case 'level': return stats.byLevel.map(d => ({ name: d.label, value: d.count }));
      case 'year': return stats.enrollmentByYear.map(d => ({ name: d.yearName, value: d.count }));
      case 'course': return stats.byCourse.map(d => ({ name: d.label, value: d.count }));
      default: return [];
    }
  };

  const chartData = getChartData();

  const clearFilters = () => {
    setFilterYear('all');
    setFilterModality('all');
    setFilterCourse('all');
  };

  const hasActiveFilters = filterYear !== 'all' || filterModality !== 'all' || filterCourse !== 'all';

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20 text-black">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 {profile?.role === 'grower' ? <GraduationCapIcon size={32} /> : <BarChart3 size={32} />}
              </div>
              {profile?.role === 'grower' ? 'Mi Panel de Grower' : 'Panel de Control Institucional'}
           </h1>
           <p className="text-slate-500 font-medium mt-2">
             {profile?.role === 'grower' ? 'Visualiza tu carga académica y progreso' : 'Visión analítica en tiempo real de la comunidad Renfort'}
           </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm font-black text-xs uppercase tracking-widest text-slate-500">
             <CalendarDays size={18} className="text-indigo-600" />
             Ciclo Académico Actual
          </div>
          {hasActiveFilters && isSupport && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
            >
              <XCircle size={14} />
              Limpiar Filtros
            </button>
          )}
        </div>
      </header>

      {profile?.role === 'grower' && (
        <div className="mb-10">
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <GraduationCapIcon className="text-indigo-600" size={24} /> 
                Mi Asignación Académica
              </h3>
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {myAssignments.length} Materias Asignadas
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myAssignments.map((assignment) => (
                <div key={assignment.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <BookOpen size={24} />
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {assignment.course}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">{assignment.subject_name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{assignment.station_name}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Layers size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">{assignment.academic_level}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPinIcon size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">{assignment.atelier}</span>
                    </div>
                  </div>
                </div>
              ))}
              {myAssignments.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aún no tienes materias asignadas</p>
                  <p className="text-slate-400 text-[10px] mt-1">Contacta al equipo de soporte para configurar tu carga académica.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Global Filters Row */}
      {isSupport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Año</label>
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="all">Todos los Años</option>
            {data.availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Modalidad</label>
          <select 
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="all">Todas las Modalidades</option>
            {data.availableModalities.map(m => <option key={m} value={m}>{m === 'RS' ? 'Renfort Sede' : m === 'RC' ? 'Renfort Casa' : m}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Curso</label>
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="all">Todos los Cursos</option>
            {data.availableCourses.map(c => <option key={c} value={c}>Grado {c}</option>)}
          </select>
        </div>
      </div>
      )}

      {isSupport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard title="Seeds Activos" value={stats.totalActive} icon={UserCheck} color="bg-indigo-500" sub="Matrícula vigente" />
          <KPICard title="Tasa Retención" value={`${retentionRate}%`} icon={TrendingUp} color="bg-emerald-500" sub="Fidelidad histórica" />
          <KPICard title="Paz y Salvo" value={`${pazYSalvoRate}%`} icon={CreditCard} color="bg-amber-500" sub="Salud administrativa" />
          <KPICard title="Archivo Histórico" value={stats.totalRetired} icon={UserX} color="bg-slate-400" sub="Seeds egresados/retirados" />
        </div>
      )}

      {isSupport && (stats.upcomingEndingsCount > 0 || stats.pendingFinalReportsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {stats.upcomingEndingsCount > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <CalendarDays size={32} />
              </div>
              <div>
                <h3 className="text-amber-900 font-black text-xl tracking-tight">{stats.upcomingEndingsCount} Estudiantes</h3>
                <p className="text-amber-700/70 font-bold text-sm">Finalizan periodo en los próximos 30 días</p>
              </div>
              <button 
                onClick={() => window.location.href = '/academic_records'}
                className="ml-auto px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md"
              >
                Ver Todos
              </button>
            </div>
          )}

          {stats.pendingFinalReportsCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h3 className="text-rose-900 font-black text-xl tracking-tight">{stats.pendingFinalReportsCount} Reportes Finales</h3>
                <p className="text-rose-700/70 font-bold text-sm">Pendientes por enviar para el cierre de año</p>
              </div>
              <button 
                onClick={() => window.location.href = '/academic_records'}
                className="ml-auto px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md"
              >
                Atender
              </button>
            </div>
          )}
        </div>
      )}

      {isSupport && (
        <Card className="p-8 mb-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Filter size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Análisis Detallado de Población</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Personaliza tu vista de datos</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Dimension Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['modality', 'grade', 'atelier', 'level', 'year', 'course'] as Dimension[]).map(dim => (
                <button
                  key={dim}
                  onClick={() => setActiveDimension(dim)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDimension === dim ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {dim === 'modality' ? 'Modalidad' : 
                   dim === 'grade' ? 'Grado' : 
                   dim === 'atelier' ? 'Estación/Atelier' : 
                   dim === 'level' ? 'Nivel' : 
                   dim === 'year' ? 'Año' : 'Curso'}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveChartType('bar')}
                className={`p-2 rounded-lg transition-all ${activeChartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                <BarChart3 size={18} />
              </button>
              <button
                onClick={() => setActiveChartType('pie')}
                className={`p-2 rounded-lg transition-all ${activeChartType === 'pie' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                <PieChart size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeDimension}-${activeChartType}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {activeChartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        style={{ fill: '#64748b', fontSize: '10px', fontWeight: 900 }} 
                      />
                    </Bar>
                  </BarChart>
                ) : (
                  <RePieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  </RePieChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
      )}

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={24} /> 
              Alertas de Notas Pendientes
            </h3>
            <button
              onClick={handleManualCheck}
              disabled={isCheckingNotifications}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isCheckingNotifications ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
              Verificar Ahora
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            {notifications.filter(n => n.type === 'warning' || n.type === 'info').slice(0, 5).map((notif) => (
              <div key={notif.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                <div className={`p-2 rounded-lg shrink-0 ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {notif.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 mb-1">{notif.title}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">
                    {format(new Date(notif.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <ShieldAlert size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No hay alertas pendientes</p>
              </div>
            )}
          </div>
        </Card>

        {isSupport && (
          <Card>
             <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieChart className="text-indigo-600" size={24} /> Distribución por Estación (Atelier)</h3>
             <div className="space-y-6">
                {stats.byAtelier.length > 0 ? stats.byAtelier.map((mod, idx) => (
                  <div key={mod.label} className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{mod.label}</span>
                        <span className="text-xs font-black text-indigo-600">{mod.count} Seeds</span>
                     </div>
                     <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <div className="h-full transition-all duration-1000 bg-indigo-500" style={{ width: `${(mod.count / (stats.totalActive || 1)) * 100}%` }}></div>
                     </div>
                  </div>
                )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-xs">Sin datos para graficar</p>}
             </div>
          </Card>
        )}

        {isSupport && (
          <Card>
             <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><School className="text-indigo-600" size={24} /> Histórico de Matrícula</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.enrollmentByYear.length > 0 ? stats.enrollmentByYear.map(year => (
                  <div key={year.yearName} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group hover:shadow-md">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                         <CalendarDays size={20} />
                       </div>
                       <span className="font-black text-slate-600 group-hover:text-slate-900">{year.yearName}</span>
                     </div>
                     <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100">{year.count}</span>
                  </div>
                )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-xs col-span-2">Sin años registrados</p>}
             </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, sub }: any) => (
  <Card className="relative overflow-hidden group hover:scale-[1.02] transition-all text-black">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 -mr-8 -mt-8 rounded-full`}></div>
    <div className="flex items-center gap-6 relative z-10">
       <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}><Icon size={28} /></div>
       <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{sub}</p>
       </div>
    </div>
  </Card>
);
