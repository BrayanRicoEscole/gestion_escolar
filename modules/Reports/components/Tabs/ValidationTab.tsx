
import React, { useState } from 'react';
import { Search, Filter, Send, CheckCircle, CreditCard, Clock, Eye, Loader2, MailCheck } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ValidationBadge } from '../Shared/ValidationBadge';
import { ReportPreviewModal } from '../Preview/ReportPreviewModal';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { sendAcademicReportEmail } from '../../../../services/api/email.api';
import { supabase } from '../../../../services/api/client';
import { Student, SchoolYear, Station, GradeEntry, StudentComment, SkillSelection } from '../../../../types';
import ReactDOM from 'react-dom/client';
import GlobalLearningReport from '../Preview/template/GlobalLearningReport';

interface ValidationTabProps {
  validationResults: any[];
  schoolYear: SchoolYear | null;
  currentStation: Station | null;
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allGrades: GradeEntry[];
  allComments: StudentComment[];
  skillSelections: SkillSelection[];
}

export const ValidationTab: React.FC<ValidationTabProps> = ({
  validationResults,
  schoolYear,
  currentStation,
  selectedStationId,
  setSelectedStationId,
  searchTerm,
  setSearchTerm,
  allGrades,
  allComments,
  skillSelections
}) => {
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const { generatePdfBlob } = usePdfGenerator();

  const handleBulkSend = async () => {
    const aptStudents = validationResults.filter(r => r.canSend);
    if (!aptStudents.length || !currentStation) return;

    if (!window.confirm(`¿Estás seguro de enviar los reportes de ${aptStudents.length} estudiantes aptos? Esta acción enviará correos a acudientes y equipo financiero.`)) {
      return;
    }

    setIsBulkSending(true);
    setSendingProgress(0);

    const { data: { session } } = await supabase.auth.getSession();
    const senderEmail = session?.user?.email;

    // Crear un contenedor temporal oculto pero presente en el DOM
    const tempDiv = document.createElement('div');
    tempDiv.id = 'bulk-pdf-render-target';
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.zIndex = '-1000'; // Detrás de todo
    tempDiv.style.opacity = '0.01'; // Casi invisible pero renderizado
    tempDiv.style.pointerEvents = 'none';
    tempDiv.style.width = '1050px'; 
    document.body.appendChild(tempDiv);
    
    const root = ReactDOM.createRoot(tempDiv);

    try {
      for (let i = 0; i < aptStudents.length; i++) {
        const item = aptStudents[i];
        const student = item.student;
        
        // 1. Renderizar el reporte del estudiante específico
        root.render(
          <GlobalLearningReport 
            student={student}
            schoolYear={schoolYear}
            currentStation={currentStation}
            grades={allGrades}
            skillSelections={skillSelections}
            comment={allComments.find(c => c.studentId === student.id)}
          />
        );

        // Aumentamos la espera para asegurar que React termine el renderizado de todas las páginas
        await new Promise(resolve => setTimeout(resolve, 800));

        // 2. Generar el Blob PDF
        const pdfBlob = await generatePdfBlob('bulk-pdf-render-target', `Reporte_${student.full_name}.pdf`);

        // 3. Enviar por correo
        await sendAcademicReportEmail({
          student,
          pdfBlob,
          senderEmail,
          stationName: currentStation.name
        });

        setSendingProgress(Math.round(((i + 1) / aptStudents.length) * 100));
      }
      alert("Proceso de envío masivo completado.");
    } catch (e: any) {
      console.error("Error en envío masivo:", e);
      alert(`Hubo un error en el proceso: ${e.message}`);
    } finally {
      setIsBulkSending(false);
      root.unmount();
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <Card className="flex flex-wrap items-center gap-6" padding="sm">
        <div className="flex items-center gap-4 border-r pr-6">
          <Filter size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filtros Reporte</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400 uppercase">Estación</label>
          <select 
            value={selectedStationId} 
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-50 border-none text-sm text-black font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          >
            {schoolYear?.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="relative flex-1 max-w-md mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar Seed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold"
          />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Estación Finaliza</p>
            <p className="text-xs font-bold text-slate-700">{currentStation?.endDate || '—'}</p>
          </div>
          <button 
            onClick={handleBulkSend}
            disabled={isBulkSending || !validationResults.some(r => r.canSend)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-30 ${isBulkSending ? 'bg-slate-700 text-white' : 'bg-primary text-white hover:bg-primary-hover'}`}
          >
            {isBulkSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isBulkSending ? `Enviando ${sendingProgress}%` : `Enviar ${validationResults.filter(r => r.canSend).length} Aptos`}
          </button>
        </div>
      </Card>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Seed / Estudiante</th>
              <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Notas ({currentStation?.name})</th>
              <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Comentarios</th>
              <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Paz y Salvo</th>
              <th className="px-6 py-5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Periodo</th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {validationResults.map(({ student, validations, canSend, progress }) => (
              <tr key={student.document} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{student.full_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {student.document} • {student.calendario || 'A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col items-center gap-1.5">
                    <ValidationBadge isValid={validations.grades_complete} label={validations.grades_complete ? '100%' : `${Math.round(progress)}%`} />
                    <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${validations.grades_complete ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ValidationBadge 
                    isValid={validations.comments_approved} 
                    label={validations.comments_approved ? 'Aprobado' : 'Pendiente'} 
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    {validations.paz_y_salvo ? 
                      <span title="Al día"><CheckCircle className="text-green-500" size={18} /></span> : 
                      <span title="Pendiente Pago"><CreditCard className="text-rose-500" size={18} /></span>
                    }
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {validations.station_closed ? 
                      <CheckCircle className="text-green-500" size={14} /> : 
                      <Clock className="text-amber-500" size={14} />
                    }
                    <span className="text-[8px] font-black uppercase text-slate-400">
                      {validations.station_closed ? 'Cerrado' : 'Vigente'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setPreviewStudent(student)}
                      className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 rounded-xl transition-all shadow-sm"
                      title="Previsualizar Reporte"
                    >
                      <Eye size={18} />
                    </button>
                    {canSend ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                        Apto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Retenido
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewStudent && (
        <ReportPreviewModal 
          student={previewStudent}
          schoolYear={schoolYear}
          currentStation={currentStation}
          grades={allGrades}
          comment={allComments.find(c => c.studentId === previewStudent.id)}
          skillSelections={skillSelections}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};
