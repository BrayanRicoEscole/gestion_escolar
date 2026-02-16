import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, CreditCard, Home, MapPin, 
  TrendingUp, BarChart3, PieChart, School, Loader2, ArrowUpRight, 
  CalendarDays, Info, AlertTriangle
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../../services/api';
import { Card } from '../../components/ui/Card';

export const DashboardModule: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data);
        setError(null);
      })
      .catch(err => {
        console.error("[Dashboard] Error cargando estadísticas:", err);
        setError("No se pudieron cargar los datos. Verifica que las tablas existan y tengas permisos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Calculando indicadores estratégicos...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20">
        <Card className="border-amber-200 bg-amber-50/30 p-12 text-center">
           <AlertTriangle size={48} className="text-amber-500 mx-auto mb-6" />
           <h3 className="text-xl font-black text-slate-900 mb-2">Panel de Control sin Datos</h3>
           <p className="text-slate-600 mb-8 font-medium">No hay registros de estudiantes para procesar estadísticas o hay un problema de conexión con la base de datos.</p>
           <div className="p-4 bg-white rounded-2xl border border-amber-100 text-left">
              <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Acción sugerida:</p>
              <p className="text-xs text-slate-500">Ve al módulo de <strong>Estudiantes</strong> e importa datos desde un CSV o vincula seeds a un año escolar.</p>
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 text-black">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <BarChart3 size={32} />
              </div>
              Panel de Control Institucional
           </h1>
           <p className="text-slate-500 font-medium mt-2">Visión global y analítica en tiempo real de la comunidad Renfort</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
           <CalendarDays size={18} className="text-primary" />
           <span className="text-sm font-black text-slate-700">Ciclo Académico Actual</span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Seeds Activos" value={stats.totalActive} icon={UserCheck} color="bg-blue-500" sub="Matrícula vigente" />
        <KPICard title="Tasa Retención" value={`${retentionRate}%`} icon={TrendingUp} color="bg-green-500" sub="Fidelidad histórica" />
        <KPICard title="Paz y Salvo" value={`${pazYSalvoRate}%`} icon={CreditCard} color="bg-amber-500" sub="Salud administrativa" />
        <KPICard title="Archivo Histórico" value={stats.totalRetired} icon={UserX} color="bg-slate-400" sub="Seeds egresados/retirados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><PieChart className="text-primary" size={24} /> Población por Modalidad</h3>
           <div className="space-y-8">
              {stats.byModality.length > 0 ? stats.byModality.map(mod => (
                <div key={mod.label} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{mod.label}</span>
                      <span className="text-sm font-black text-primary">{mod.count} Seeds ({mod.percentage}%)</span>
                   </div>
                   <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                      <div className={`h-full transition-all duration-1000 ${mod.label.includes('Sede') ? 'bg-primary' : 'bg-orange-500'}`} style={{ width: `${mod.percentage}%` }}></div>
                   </div>
                </div>
              )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-xs">Sin datos para graficar</p>}
           </div>
        </Card>

        <Card>
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><School className="text-primary" size={24} /> Histórico de Matrícula</h3>
           <div className="space-y-4">
              {stats.enrollmentByYear.length > 0 ? stats.enrollmentByYear.map(year => (
                <div key={year.yearName} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                   <span className="font-black text-slate-600 group-hover:text-primary">{year.yearName}</span>
                   <span className="px-3 py-1 bg-white rounded-lg text-xs font-black shadow-sm">{year.count}</span>
                </div>
              )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-xs">Sin años registrados</p>}
           </div>
        </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, sub }: any) => (
  <Card className="relative overflow-hidden group hover:scale-[1.02] transition-all">
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