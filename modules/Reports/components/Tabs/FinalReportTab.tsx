
import React, { useMemo, useState } from 'react';
import { 
  FileCheck, Calendar, Info, AlertCircle, 
  ArrowRight, Download, Send, Search, CheckCircle2, Clock, Eye
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ReportPreviewModal } from '../Preview/ReportPreviewModal';
import { Student, SchoolYear, Station, GradeEntry, StudentComment, SkillSelection } from '../../../../types';

interface FinalReportTabProps {
  students: Student[];
  schoolYear: SchoolYear | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allGrades: GradeEntry[];
  allComments: StudentComment[];
  skillSelections: SkillSelection[];
}

export const FinalReportTab: React.FC<FinalReportTabProps> = ({ 
  students, 
  schoolYear,
  searchTerm, 
  setSearchTerm,
  allGrades,
  allComments,
  skillSelections
}) => {
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);

  const finalValidation = useMemo(() => {
    if (!schoolYear) return [];

    return students.map(student => {
      const calType = student.calendario || 'A';
      let stationsIncluded: string[] = [];
      let status: 'ready' | 'pending' | 'blocked' = 'ready';
      let reason = "";

      if (calType === 'A') {
        stationsIncluded = schoolYear.stations.map(s => s.name);
      } else if (calType === 'B') {
        stationsIncluded = ["Historico 2025-W3", "Historico 2025-W4", "2026-S1", "2026-S2"];
      } else {
        stationsIncluded = [`Rango: ${student.inicio || '—'} a ${student.fin || '—'}`];
      }

      const now = new Date();
      const allStationsClosed = schoolYear.stations.every(s => new Date(s.endDate) < now);
      
      if (!allStationsClosed && calType === 'A') {
        status = 'pending';
        reason = "Año escolar en curso";
      }

      const isPazYSalvo = student.paz_y_salvo?.toLowerCase().includes('ok') || 
                         student.paz_y_salvo?.toLowerCase().includes('si') || 
                         student.paz_y_salvo === 'Sí';
                         
      if (!isPazYSalvo) {
        status = 'blocked';
        reason = "Deuda Financiera Activa";
      }

      return { student, calType, stationsIncluded, status, reason, allStationsClosed };
    }).filter(item => 
      item.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.document.includes(searchTerm)
    );
  }, [students, searchTerm, schoolYear]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por nombre o ID de Seed..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-[2rem] text-sm font-black shadow-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Download}>Exportar Excel Consolidado</Button>
          <Button icon={Send} disabled={!finalValidation.some(v => v.status === 'ready')}>
            Generar Reportes Finales ({finalValidation.filter(v => v.status === 'ready').length})
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {finalValidation.map((item, idx) => (
          <Card key={idx} className={`group transition-all border-l-8 ${
            item.status === 'ready' ? 'border-l-green-500' : 
            item.status === 'pending' ? 'border-l-amber-500' : 'border-l-rose-500'
          }`} padding="sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                  {item.student.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg tracking-tight leading-tight">{item.student.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">ID: {item.student.document}</span>
                    <span className="px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black uppercase text-primary">Calendario {item.calType}</span>
                  </div>
                </div>
              </div>

              <div className="flex-[1.5]">
                <div className="flex items-center gap-2 mb-2">
                   <Calendar size={14} className="text-primary" />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estaciones Consolidadas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.stationsIncluded.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPreviewStudent(item.student)}
                  className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 rounded-2xl transition-all shadow-sm"
                  title="Vista Previa de Certificado"
                >
                  <Eye size={22} />
                </button>
                <div className="text-right min-w-[150px]">
                   <div className="flex items-center gap-2 justify-end mb-1">
                      {item.status === 'ready' ? (
                        <span className="text-green-600 font-black text-[10px] uppercase flex items-center gap-1">
                           <CheckCircle2 size={14} /> Apto
                        </span>
                      ) : (
                        <span className={`${item.status === 'pending' ? 'text-amber-600' : 'text-rose-600'} font-black text-[10px] uppercase flex items-center gap-1`}>
                           <AlertCircle size={14} /> {item.reason}
                        </span>
                      )}
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Año Lectivo {schoolYear?.name}</p>
                </div>
                <button className={`p-4 rounded-2xl transition-all shadow-sm ${item.status === 'ready' ? 'bg-primary text-white hover:scale-110' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                   <FileCheck size={24} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {previewStudent && (
        <ReportPreviewModal 
          student={previewStudent}
          schoolYear={schoolYear}
          currentStation={schoolYear?.stations[0] || null} // Usar la primera estación por defecto para el reporte final
          grades={allGrades}
          comment={allComments.find(c => c.studentId === previewStudent.id)}
          skillSelections={skillSelections}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};
