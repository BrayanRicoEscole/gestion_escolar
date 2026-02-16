
import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2, Award, Loader2, Sparkles, FileDown, Send, MailCheck } from 'lucide-react';
import { Student, SchoolYear, GradeEntry, StudentComment, Station, SkillSelection } from '../../../../types';
import { useReport } from '../../hooks/useReports';
import { useTemplates } from '../../hooks/useTemplates';
import { useDocxGenerator } from '../../hooks/useDocxGenerator';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { sendAcademicReportEmail } from '../../../../services/api/email.api';
import { supabase } from '../../../../services/api/client';
import GlobalLearningReport from './template/GlobalLearningReport';

interface Props {
  student: Student;
  schoolYear: SchoolYear | null;
  currentStation: Station | null;
  grades: GradeEntry[];
  comment?: StudentComment;
  skillSelections: SkillSelection[];
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<Props> = ({
  student,
  schoolYear,
  currentStation,
  grades,
  comment,
  skillSelections,
  onClose
}) => {
  if (!currentStation) return null;

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { reportData, generalAverage } = useReport(
    currentStation,
    student,
    grades,
    skillSelections
  );

  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading
  } = useTemplates();

  const { generateDocx, isGenerating: isDocxGenerating } = useDocxGenerator({
    templates,
    selectedTemplateId,
    student,
    station: currentStation,
    reportData, 
    generalAverage,
    comment: comment,
    skillSelections: skillSelections || []
  });

  const { generatePdfBlob, isGenerating: isPdfGenerating } = usePdfGenerator();

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // 1. Obtener correo del usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      const senderEmail = session?.user?.email;

      // 2. Generar el PDF del componente visible
      const pdfBlob = await generatePdfBlob('printable-report', `Reporte_${student.full_name}.pdf`);

      // 3. Enviar correo
      await sendAcademicReportEmail({
        student,
        pdfBlob,
        senderEmail,
        stationName: currentStation.name
      });

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (error: any) {
      alert(`Error al enviar: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[95vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Barra de Herramientas Premium */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">Generador de Reportes</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">Sincronización Supabase Cloud</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {sendSuccess && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2">
                <MailCheck size={16} />
                <span className="text-[10px] font-black uppercase">Enviado con éxito</span>
              </div>
            )}

            <div className="flex flex-col gap-1 items-end">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Seleccionar Plantilla .docx</span>
              <select 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-white/10 border-none text-[10px] font-black text-white rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer outline-none hover:bg-white/20 transition-all"
              >
                {isLoading  ? (
                  <option>Cargando...</option>
                ) : (
                  templates.map(t => <option key={t.id} value={t.id} className="text-black">{t.name}</option>)
                )}
              </select>
            </div>

            <div className="h-8 w-[1px] bg-white/10"></div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSendEmail}
                disabled={isSending || isPdfGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
              >
                {isSending || isPdfGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Enviando...' : 'Enviar por Correo'}
              </button>
              
              <button 
                onClick={generateDocx}
                disabled={isDocxGenerating || !selectedTemplateId}
                className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
              >
                {isDocxGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                {isDocxGenerating ? 'Procesando...' : 'Generar .docx'}
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black transition-all shadow-xl hover:bg-slate-100">
                <Printer size={16} /> Exportar PDF
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Papel del Reporte */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-12 custom-scrollbar print:bg-white print:p-0">
          <div id="printable-report" className="">
            <GlobalLearningReport
              student={student}
              schoolYear={schoolYear}
              currentStation={currentStation}
              grades={grades}
              skillSelections={skillSelections}
              comment={comment}
            />
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${generalAverage >= 3.7 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              Promedio Estación: {generalAverage >= 3.7 ? 'Consolidado' : 'No Consolidado'}
            </div>
            {generalAverage >= 4.5 && (
              <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Award size={14} /> Consolidado promedio general
              </div>
            )}
          </div>
          <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-2xl">
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
