
import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, CreditCard, Home, MapPin, 
  TrendingUp, BarChart3, PieChart, School, Loader2, ArrowUpRight, 
  CalendarDays, Info
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../../services/api';
import { Card } from '../../components/ui/Card';

export const DashboardModule: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Calculando indicadores estratégicos...</p>
      </div>
    );
  }

  const retentionRate = Math.round((stats.totalActive / (stats.totalActive + stats.totalRetired)) * 100);
  const pazYSalvoRate = Math.round((stats.pazYSalvoCount / stats.totalActive) * 100);

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
           <span className="text-sm font-black text-slate-700">Ciclo Académico 2026</span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Seeds Activos" 
          value={stats.totalActive} 
          icon={UserCheck} 
          color="bg-blue-500" 
          sub="Matrícula vigente"
        />
        <KPICard 
          title="Tasa Retención" 
          value={`${retentionRate}%`} 
          icon={TrendingUp} 
          color="bg-green-500" 
          sub="Fidelidad histórica"
        />
        <KPICard 
          title="Paz y Salvo" 
          value={`${pazYSalvoRate}%`} 
          icon={CreditCard} 
          color="bg-amber-500" 
          sub="Salud administrativa"
        />
        <KPICard 
          title="Archivo Histórico" 
          value={stats.totalRetired} 
          icon={UserX} 
          color="bg-slate-400" 
          sub="Seeds egresados/retirados"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Distribución por Modalidad */}
        <Card className="lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                 <PieChart className="text-primary" size={24} /> Población por Modalidad
              </h3>
           </div>
           <div className="space-y-8">
              {stats.byModality.map(mod => (
                <div key={mod.label} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{mod.label}</span>
                      <span className="text-sm font-black text-primary">{mod.count} Seeds ({mod.percentage}%)</span>
                   </div>
                   <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ${mod.label.includes('Sede') ? 'bg-primary' : 'bg-orange-500'}`} 
                        style={{ width: `${mod.percentage}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
              <Info size={20} className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                Nota: La modalidad impacta directamente en el cálculo de reportes finales y sufijos de grupo (-M para Sede, -C para Casa).
              </p>
           </div>
        </Card>

        {/* Matrícula por Año */}
        <Card>
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <School className="text-primary" size={24} /> Histórico de Matrícula
           </h3>
           <div className="space-y-4">
              {stats.enrollmentByYear.map(year => (
                <div key={year.yearName} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                   <span className="font-black text-slate-600 group-hover:text-primary">{year.yearName}</span>
                   <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white rounded-lg text-xs font-black shadow-sm">{year.count}</span>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                   </div>
                </div>
              ))}
           </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Distribución por Grado */}
        <Card>
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <TrendingUp className="text-primary" size={24} /> Población por Grado
           </h3>
           <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {stats.byGrade.map(g => (
                <div key={g.label} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                   <span className="text-xs font-bold text-slate-600 uppercase">{g.label}</span>
                   <span className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center font-black text-xs">
                      {g.count}
                   </span>
                </div>
              ))}
           </div>
        </Card>

        {/* Distribución por Atelier */}
        <Card>
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <MapPin className="text-primary" size={24} /> Por Atelier
           </h3>
           <div className="space-y-3">
              {stats.byAtelier.map(at => (
                <div key={at.label} className="flex items-center gap-4">
                   <div className="flex-1">
                      <div className="flex justify-between mb-1">
                         <span className="text-[10px] font-black uppercase text-slate-500">{at.label}</span>
                         <span className="text-[10px] font-black text-slate-800">{at.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-slate-900" style={{ width: `${(at.count / stats.totalActive) * 100}%` }}></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </Card>

        {/* Motivos de Retiro */}
        <Card>
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <UserX className="text-rose-500" size={24} /> Análisis de Salidas
           </h3>
           <div className="space-y-4">
              {stats.withdrawalReasons.length > 0 ? stats.withdrawalReasons.map(reason => (
                <div key={reason.label} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
                   <span className="text-xs font-black text-rose-700 uppercase tracking-tight truncate max-w-[180px]">{reason.label}</span>
                   <span className="font-black text-rose-800">{reason.count}</span>
                </div>
              )) : (
                <div className="py-10 text-center opacity-40">
                   <p className="text-xs font-bold uppercase">Sin retiros registrados</p>
                </div>
              )}
           </div>
        </Card>

      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, sub }: any) => (
  <Card className="relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="flex items-center gap-6 relative z-10">
       <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{sub}</p>
       </div>
    </div>
  </Card>
);
