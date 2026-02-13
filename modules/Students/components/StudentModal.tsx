
import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  UserCircle,
  ShieldCheck,
  Mail,
  Phone,
  CreditCard,
  Activity,
  History,
  Clock,
  ArrowRight,
  BookOpen,
  UserMinus,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Student, AcademicRecord } from 'types';
import { Button } from '../../../components/ui/Button';
import { DetailSection, DetailItem } from './DetailSection';
import { getStudentAcademicHistory, retireStudent, getSchoolYearsList } from '../../../services/api';

interface Props {
  student: Student;
  onClose: () => void;
}

type Tab = 'info' | 'history';

export const StudentModal: React.FC<Props> = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [history, setHistory] = useState<AcademicRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados para retiro
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [isRetiring, setIsRetiring] = useState(false);
  const [retireReason, setRetireReason] = useState('Retiro Voluntario');
  const [retireObs, setRetireObs] = useState('');
  const [years, setYears] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getSchoolYearsList().then(setYears);
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && student.id) {
      setLoadingHistory(true);
      getStudentAcademicHistory(student.id).then(data => {
        setHistory(data);
        setLoadingHistory(false);
      });
    }
  }, [activeTab, student.id]);

  const handleRetireConfirm = async () => {
    if (!student.id || !years.length) return;
    setIsRetiring(true);
    try {
      await retireStudent({
        studentId: student.id,
        schoolYearId: years[0].id, // Asumimos el año actual
        status: retireReason,
        observations: retireObs,
        currentGrade: student.grade || 'N/A',
        currentLevel: student.academic_level || 'N/A',
        currentAtelier: student.atelier || 'N/A',
        currentModality: student.modality || 'N/A'
      });
      alert("Estudiante retirado exitosamente.");
      onClose();
    } catch (e) {
      alert("Error al procesar el retiro.");
    } finally {
      setIsRetiring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 bg-primary text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-black border border-white/5">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-tight">
                {student.full_name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  ID: {student.document}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${student.estado_actual?.toLowerCase().includes('activo') ? 'bg-green-500' : 'bg-rose-500'}`}>
                  {student.estado_actual}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
             <button 
               onClick={() => setActiveTab('info')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white'}`}
             >
               <UserCircle className="inline mr-2" size={14} /> Ficha Personal
             </button>
             <button 
               onClick={() => setActiveTab('history')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white'}`}
             >
               <History className="inline mr-2" size={14} /> Historial Académico
             </button>
          </div>

          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50 text-black">
          {activeTab === 'info' ? (
            <div className="animate-in slide-in-from-left-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <AcademicSection student={student} />
                  <PersonalSection student={student} />
                  <InstitutionalSection student={student} />
                  <GuardianMainSection student={student} />
                  <GuardianSecondarySection student={student} />
                  <FinancialSection student={student} />
                  <HealthSection student={student} />
               </div>
               
               {/* Admin Actions Area */}
               {student.estado_actual?.toLowerCase().includes('activo') && (
                 <div className="mt-20 pt-10 border-t border-slate-200">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Gestión de Matrícula (Admin)</h4>
                    <button 
                      onClick={() => setIsRetireModalOpen(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm"
                    >
                      <UserMinus size={18} /> Retirar Estudiante de la Institución
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                 <Clock className="text-primary" /> Línea de Tiempo Institucional
              </h3>
              
              {loadingHistory ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compilando registros históricos...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-slate-200 before:rounded-full">
                  {history.map((record, idx) => (
                    <div key={record.id} className="relative pl-20 group">
                      <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 border-white shadow-md z-10 ${idx === 0 ? 'bg-primary' : 'bg-slate-300'}`}></div>
                      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group-hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">{record.school_year_name}</span>
                             <span className="text-sm font-black text-slate-800 tracking-tight">Grado {record.grade} ({record.academic_level})</span>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase">Atelier</p>
                                 <p className="text-xs font-bold text-slate-700">{record.atelier}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase">Modalidad</p>
                                 <p className="text-xs font-bold text-slate-700">{record.modality}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase">Estado Final</p>
                                 <span className={`text-[10px] font-black px-2 py-0.5 rounded ${record.status?.toLowerCase().includes('promovido') ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {record.status}
                                 </span>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase">F. Registro</p>
                                 <p className="text-xs font-bold text-slate-700">{new Date(record.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           {record.observations && (
                             <p className="mt-4 p-4 bg-slate-50 rounded-2xl text-[11px] text-slate-500 italic border border-slate-100">
                               "{record.observations}"
                             </p>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <History size={48} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No existen registros previos para este seed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      {/* Retire Dialog */}
      {isRetireModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-black">Retirar Seed de la Institución</h3>
             <p className="text-slate-500 text-sm mb-8">Esta acción actualizará el estado del estudiante y generará un registro en su historial académico.</p>
             
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Causa del Retiro</label>
                   <select 
                     value={retireReason}
                     onChange={e => setRetireReason(e.target.value)}
                     className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm text-black focus:ring-4 focus:ring-rose-100"
                   >
                     <option>Retiro Voluntario</option>
                     <option>Retiro Académico</option>
                     <option>Retiro Disciplinario</option>
                     <option>Graduado / Egresado</option>
                     <option>Otros</option>
                   </select>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Observaciones / Motivo detallado</label>
                   <textarea 
                     value={retireObs}
                     onChange={e => setRetireObs(e.target.value)}
                     className="w-full p-5 bg-slate-50 border-none rounded-2xl font-medium text-sm text-black focus:ring-4 focus:ring-rose-100 resize-none h-32"
                     placeholder="Explique brevemente el contexto del retiro..."
                   />
                </div>
             </div>

             <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setIsRetireModalOpen(false)}
                  className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleRetireConfirm}
                  disabled={isRetiring}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  {isRetiring ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                  Confirmar Retiro
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AcademicSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<GraduationCap size={18} />} title="Académico" color="text-blue-500">
    <DetailItem label="Nivel Académico" value={student.academic_level} />
    <DetailItem label="Grado" value={student.grade} />
    <DetailItem label="Grupo" value={student.calendario_grupo} />
    <DetailItem label="Atelier" value={student.atelier} />
  </DetailSection>
);

const PersonalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<UserCircle size={18} />} title="Personal" color="text-purple-500">
    <DetailItem label="Nacimiento" value={student.nacimiento} />
    <DetailItem label="Edad" value={student.edad} />
    <DetailItem label="Género" value={student.genero} />
  </DetailSection>
);

const InstitutionalSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<ShieldCheck size={18} />} title="Institucional" color="text-green-500">
    <DetailItem label="Cuenta Inst." value={student.cuenta_institucional} />
    <DetailItem label="Inicio" value={student.inicio} />
  </DetailSection>
);

const GuardianMainSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Mail size={18} />} title="Acudiente" color="text-rose-500">
    <DetailItem label="Nombre" value={student.acudiente_academico} />
    <DetailItem label="Teléfono" value={student.telefono_a} />
  </DetailSection>
);

const GuardianSecondarySection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Phone size={18} />} title="Financiero" color="text-indigo-500">
    <DetailItem label="Responsable" value={student.acudiente_financiero} />
    <DetailItem label="Teléfono" value={student.telefono_financiero} />
  </DetailSection>
);

const FinancialSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<CreditCard size={18} />} title="Estado" color="text-amber-500">
    <DetailItem label="Paz y Salvo" value={student.paz_y_salvo} />
    <DetailItem label="Contrato" value={student.contrato} />
  </DetailSection>
);

const HealthSection = ({ student }: { student: Student }) => (
  <DetailSection icon={<Activity size={18} />} title="Salud" color="text-cyan-500">
    <DetailItem label="Póliza" value={student.poliza} />
  </DetailSection>
);
