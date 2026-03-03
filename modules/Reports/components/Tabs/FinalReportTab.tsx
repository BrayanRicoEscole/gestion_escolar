
import React, { useMemo, useState } from 'react';
import { 
  FileCheck, Calendar, Info, AlertCircle, 
  ArrowRight, Download, Send, Search, CheckCircle2, Clock, Eye
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { FinalReportModal } from '../Preview/FinalReportModal';
import { Student, SchoolYear, Station, GradeEntry, StudentComment, SkillSelection } from '../../../../types';

interface FinalReportTabProps {
  students: Student[];
  schoolYear: SchoolYear | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allGrades: GradeEntry[];
  allComments: StudentComment[];
  skillSelections: SkillSelection[];
  fetchYearStudentData: (studentId: string) => Promise<void>;
  selectedCalendar: string;
  setSelectedCalendar: (cal: string) => void;
  selectedStations: string[];
  setSelectedStations: (stations: string[]) => void;
}

export const FinalReportTab: React.FC<FinalReportTabProps> = ({ 
  students, 
  schoolYear,
  searchTerm, 
  setSearchTerm,
  allGrades,
  allComments,
  skillSelections,
  fetchYearStudentData,
  selectedCalendar,
  setSelectedCalendar,
  selectedStations,
  setSelectedStations
}) => {
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);

  const handlePreview = async (student: Student) => {
    setPreviewStudent(student);
    if (student.id) {
      await fetchYearStudentData(student.id);
    }
  };

  const finalValidation = useMemo(() => {
    if (!schoolYear) return [];

    return students.map(student => {
      const calType = student.calendario || 'A';
      let stationsIncluded: string[] = [];
      let status: 'ready' | 'pending' | 'blocked' = 'ready';
      let reason = "";

      if (calType === 'A') {
        stationsIncluded = schoolYear.stations
          .filter(s => selectedStations.includes(s.id))
          .map(s => s.name);
      } else if (calType === 'B') {
        stationsIncluded = ["Historico 2025-W3", "Historico 2025-W4", "2026-S1", "2026-S2"]
          .filter(s => selectedStations.length === 0 || selectedStations.some(id => s.includes(id) || schoolYear.stations.find(st => st.id === id)?.name === s));
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
      <div className="flex flex-col gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-8">
          {/* Filtro de Calendario */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Filtrar por Calendario</span>
            <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {(['all', 'A', 'B'] as const).map((cal) => (
                <button
                  key={cal}
                  onClick={() => setSelectedCalendar(cal)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCalendar === cal
                      ? 'bg-slate-900 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                  }`}
                >
                  {cal === 'all' ? 'Todos' : `Calendario ${cal}`}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Estaciones */}
          <div className="flex-1 space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Estaciones a Incluir</span>
            <div className="flex flex-wrap gap-2">
              {schoolYear?.stations.map((station) => {
                const isSelected = selectedStations.includes(station.id);
                return (
                  <button
                    key={station.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStations(selectedStations.filter(id => id !== station.id));
                      } else {
                        setSelectedStations([...selectedStations, station.id]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {station.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
                  onClick={() => handlePreview(item.student)}
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
        <FinalReportModal 
          student={previewStudent}
          schoolYear={schoolYear}
          allGrades={allGrades}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};
