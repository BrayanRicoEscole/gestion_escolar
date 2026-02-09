
import React from 'react';
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

const RuleCard = ({ title, desc, icon: Icon }: any) => (
  <Card className="p-8 space-y-4 hover:border-primary/20 transition-all group">
    <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h4 className="text-lg font-black text-slate-800">{title}</h4>
    <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">
      Configurar Parámetros <ChevronRight size={14} />
    </div>
  </Card>
);

export const SpecialRulesTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
      <RuleCard 
        title="Calendario A" 
        desc="Muestra notas del año académico actual. Valida fechas de inicio y fin del rango vigente." 
        icon={Clock}
      />
      <RuleCard 
        title="Calendario B" 
        desc="Incluye las 2 últimas estaciones del año anterior y las 2 primeras del actual." 
        icon={Clock}
      />
      <RuleCard 
        title="Calendario C" 
        desc="Incluye estaciones cursadas entre la fecha de inicio y fin parametrizadas." 
        icon={Clock}
      />
      
      <Card className="md:col-span-3 bg-slate-900 text-white p-12 rounded-[4rem] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-black mb-4 tracking-tight flex items-center gap-3">
              <AlertTriangle className="text-secondary" /> 
              Alertas por No Consolidación
            </h3>
            <p className="text-white/60 text-lg leading-relaxed font-medium">
              El sistema evalúa los resultados académicos al cierre de cada estación. 
              Si se detecta un promedio inferior a 3.7, se enviará una notificación automática 
              una semana antes del <strong>Open</strong> con copia a Support Académico y Secretaría.
            </p>
            <div className="mt-10 flex gap-4">
              <Button variant="secondary">Configurar Cronograma</Button>
              <Button variant="ghost" className="text-white border-white/20 hover:bg-white/10">Ver Mensaje Tipo</Button>
            </div>
          </div>
          <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            <Clock size={80} className="text-white/20" />
          </div>
        </div>
      </Card>
    </div>
  );
};
