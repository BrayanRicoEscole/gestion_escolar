
import React, { useState } from 'react';
import { X, Printer, FileText, Award, Loader2, Send, MailCheck } from 'lucide-react';
import { Student, SchoolYear, GradeEntry, Station } from '../../../../types';
import { useFinalReport } from '../../hooks/useFinalReport';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { sendAcademicReportEmail } from '../../../../services/api/email.api';
import { supabase } from '../../../../services/api/client';
import FinalReport from './template/FinalReport';

interface Props {
  student: Student;
  schoolYear: SchoolYear | null;
  allGrades: GradeEntry[];
  onClose: () => void;
}

export const FinalReportModal: React.FC<Props> = ({
  student,
  schoolYear,
  allGrades,
  onClose
}) => {
  if (!schoolYear) return null;

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { stations, finalData } = useFinalReport(
    schoolYear,
    student,
    allGrades
  );

  const { generatePdfBlob, isGenerating: isPdfGenerating } = usePdfGenerator();

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const senderEmail = session?.user?.email;

      const pdfBlob = await generatePdfBlob('printable-final-report', `Reporte_Final_${student.full_name}.pdf`);

      await sendAcademicReportEmail({
        student,
        pdfBlob,
        senderEmail,
        stationName: "Reporte Final"
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
        
        {/* Barra de Herramientas */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">Reporte Final Académico</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">Consolidado Anual</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {sendSuccess && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2">
                <MailCheck size={16} />
                <span className="text-[10px] font-black uppercase">Enviado con éxito</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSendEmail}
                disabled={isSending || isPdfGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
              >
                {isSending || isPdfGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Enviando...' : 'Enviar por Correo'}
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
          <div id="printable-final-report" className="">
            <FinalReport
              student={student}
              schoolYear={schoolYear}
              stations={stations}
              finalData={finalData}
            />
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${finalData.generalAverage >= 3.7 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              Promedio Final: {finalData.generalAverage.toFixed(2)} - {finalData.generalAverage >= 3.7 ? 'Consolidado' : 'No Consolidado'}
            </div>
          </div>
          <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-2xl">
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
