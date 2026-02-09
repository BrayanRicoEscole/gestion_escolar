
import React from 'react';
import { X, Printer, FileText, CheckCircle2, Award, Loader2, Sparkles, FileDown } from 'lucide-react';
import { Student, SchoolYear, GradeEntry, StudentComment, Station, SkillSelection } from '../../../../types';
import { useReport } from '../../hooks/useReports';
import { useTemplates } from '../../hooks/useTemplates';
import { useDocxGenerator } from '../../hooks/useDocxGenerator';

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

  const { reportData, labs, generalAverage } = useReport(
    currentStation,
    student.id,
    grades
  );

  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading
  } = useTemplates();

  const { generateDocx, isGenerating } = useDocxGenerator({
    templates,
    selectedTemplateId,
    student,
    station: currentStation,
    reportData, 
    generalAverage,
    comment: comment,
    skillSelections: skillSelections || []
  });

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
                onClick={generateDocx}
                disabled={isGenerating || !selectedTemplateId}
                className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                {isGenerating ? 'Procesando...' : 'Generar .docx'}
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
          <div id="printable-report" className="bg-white mx-auto shadow-2xl w-full max-w-[850px] min-h-[1100px] p-20 flex flex-col gap-12 print:shadow-none print:p-0 print:max-w-none">
            
            {/* Header Oficial */}
            <header className="flex justify-between items-start border-b-8 border-primary pb-10">
               <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">RED DE COLEGIOS RENFORT</h1>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Academic Report</p>
                  <div className="pt-6 grid grid-cols-2 gap-x-8 gap-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Año Lectivo: <span className="text-slate-700">{schoolYear?.name}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Estación: <span className="text-slate-700">{currentStation.name}</span></p>
                  </div>
               </div>
               <div className="text-right space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{student.full_name}</h2>
                  <p className="text-sm font-bold text-primary italic">Nivel Académico: {student.academic_level}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Seed ID: {student.document} • {student.modality === 'RS' ? 'Sede' : 'Casa'}</p>
                  <div className="pt-2">
                     <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">Certificado Oficial</span>
                  </div>
               </div>
            </header>

            {/* Cuerpo del Reporte */}
            <main className="space-y-12">
              {Object.entries(labs).map(([labName, items]) => (
                <section key={labName} className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                    <div className="w-2.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Laboratorio {labName}</h3>
                  </div>

                  <div className="border border-slate-200 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Asignatura</th>
                          {currentStation.moments.map(m => (
                            <th key={m.id} className="px-4 py-5 text-center text-[9px] font-black uppercase text-slate-400 border-l border-slate-100">
                              {m.name.split('/')[0]}
                            </th>
                          ))}
                          <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-primary border-l border-slate-100 bg-primary/5">Est..</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30">
                            <td className="px-8 py-6 text-xs font-black text-slate-800">{row.subject.name}</td>
                            {row.momentResults.map((m: any) => (
                              <td key={m.id} className="px-4 py-6 text-center border-l border-slate-100">
                                <span className={`text-xs font-black ${m.hasData ? (m.average >= 3.7 ? 'text-slate-800' : 'text-rose-500') : 'text-slate-200'}`}>
                                  {m.hasData ? (m.average >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}
                                </span>
                              </td>
                            ))}
                            <td className="px-8 py-6 text-center border-l border-slate-100 bg-primary/5">
                               <span className={`text-sm font-black ${row.finalStationAvg >= 3.7 ? 'text-primary' : 'text-rose-600'}`}>
                                 {row.finalStationAvg > 0 ? (row.finalStationAvg >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </main>

            {/* Síntesis Cualitativa */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                <div className="w-2.5 h-6 bg-secondary rounded-full"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">APRENDIZAJE ACADÉMICO</h3>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades consolidadas</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.academicCons || "Sin registros consolidados en esta estación."}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades no consolidadas</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.academicNon || "Sin registros de retos en esta estación."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                <div className="w-2.5 h-6 bg-secondary rounded-full"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">APRENDIZAJE EMOCIONAL</h3>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades socioemocionales</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.emotionalSkills || "Sin registros en esta estación."}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Talentos</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.talents || "Sin registros en esta estación."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                <div className="w-2.5 h-6 bg-secondary rounded-full"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">APRENDIZAJE CONVIVENCIAL</h3>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interacción y cooperación</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.socialInteraction || "Sin registros en esta estación."}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desafíos</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.challenges || "Sin registros en esta estación."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                <div className="w-2.5 h-6 bg-secondary rounded-full"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">LEARNING CROP Y PIAR</h3>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AplIcación y Desarrollo del Plan Individual de Ajuste Razonable (PIAR)</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.piarDesc || "Sin registros en esta estación."}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporte de los Learning Crops Descripción de la vivencia de aprendizaje práctico y el rol de la seed</p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] text-[11px] font-medium text-slate-700 min-h-[120px] border border-slate-100 leading-relaxed italic">
                    {comment?.learningCropDesc || "Sin registros en esta estación."}
                  </div>
                </div>
              </div>


              <div className="space-y-4 pt-6">
                 <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Comentario</p>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                 </div>
                 <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] text-[13px] leading-relaxed italic font-medium shadow-2xl relative overflow-hidden">
                    <Sparkles className="absolute -top-4 -right-4 text-white/5" size={120} />
                    <p className="relative z-10">{comment?.comentary || "El grower se encuentra finalizando la redacción del reporte cualitativo."}</p>
                 </div>
              </div>
            </section>
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
