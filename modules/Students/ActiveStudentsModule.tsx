
import React, { useEffect, useState } from 'react';
import { useStudents } from './hooks/useStudents';
import { useStudentFilters } from './hooks/useStudentFilters';
import { useStudentSync } from './hooks/useStudentSync';
import { Student } from '../../types';
import { SyncPanel } from './components/SyncPanel';
import { StudentsFilters } from './components/StudentsFilters';
import { StudentsTable } from './components/StudentsTable';
import { StudentModal } from './components/StudentModal';
import { enrollStudentsInYear, getSchoolYearsList, promoteStudentsInBulk, retireStudentsInBulk } from '../../services/api';
import { 
  GraduationCap, Loader2, Sparkles, CheckCircle2, ShieldQuestion, 
  TrendingUp, UserX, AlertCircle, X 
} from 'lucide-react';

export const ActiveStudentsModule: React.FC = () => {
  const { students, loading, refetch } = useStudents();
  const { filtered, filters, setters } = useStudentFilters(students);
  const { syncing, status, syncFromSpreadsheet, syncFromFile } = useStudentSync({ onSuccess: refetch });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [years, setYears] = useState<{id: string, name: string}[]>([]);
  const [targetYearId, setTargetYearId] = useState('');
  
  // Estados de Selección
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Estados de proceso
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeBulkAction, setActiveBulkAction] = useState<'enroll' | 'promote' | 'retire' | null>(null);
  
  // Datos para retiro masivo
  const [retireData, setRetireData] = useState({ reason: 'Retiro Voluntario', obs: '' });

  useEffect(() => {
    getSchoolYearsList().then(data => {
      setYears(data);
      if (data.length) setTargetYearId(data[0].id);
    });
    refetch();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.id || ''));
  };

  const selectedStudentsData = students.filter(s => selectedIds.includes(s.id || ''));

  const handleBulkEnroll = async () => {
    if (!targetYearId || selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await enrollStudentsInYear(selectedStudentsData, targetYearId);
      triggerSuccess("Matrícula masiva completada");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setActiveBulkAction(null);
    }
  };

  const handleBulkPromote = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await promoteStudentsInBulk(selectedStudentsData);
      triggerSuccess("Promoción masiva completada");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setActiveBulkAction(null);
    }
  };

  const handleBulkRetire = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await retireStudentsInBulk(selectedIds, retireData.reason, retireData.obs, targetYearId);
      triggerSuccess("Retiro masivo completada");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setActiveBulkAction(null);
    }
  };

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setSelectedIds([]);
    refetch();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      
      {/* Header Informativo */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 text-black">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <GraduationCap size={32} />
              </div>
              Gestión de Estudiantes
           </h1>
           <p className="text-slate-500 font-medium mt-2">Administra el ciclo de vida, promoción y retiro de la comunidad educativa</p>
        </div>

        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{actionSuccess}</span>
          </div>
        )}
      </header>

      <SyncPanel
        syncing={syncing}
        status={status}
        onSyncFromSheet={syncFromSpreadsheet}
        onSyncFromFile={syncFromFile}
      />

      <StudentsFilters
        students={students}
        filters={filters}
        setters={setters}
      />

      <StudentsTable
        students={filtered}
        loading={loading}
        onSelect={setSelectedStudent}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
      />

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && !activeBulkAction && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-500 w-full max-w-3xl px-4">
           <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/10">
              <div className="flex items-center gap-4 px-4">
                 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">
                    {selectedIds.length}
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest opacity-60">Seeds seleccionadas</span>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setActiveBulkAction('enroll')}
                   className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    <Sparkles size={14} className="text-secondary" /> Matricular
                 </button>
                 <button 
                   onClick={() => setActiveBulkAction('promote')}
                   className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    <TrendingUp size={14} className="text-green-400" /> Promover
                 </button>
                 <button 
                   onClick={() => setActiveBulkAction('retire')}
                   className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 transition-all"
                 >
                    <UserX size={14} /> Retirar
                 </button>
                 <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
                 <button onClick={() => setSelectedIds([])} className="p-3 text-white/40 hover:text-white transition-all"><X size={18} /></button>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modals for Bulk Actions */}
      {activeBulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
              {activeBulkAction === 'enroll' && (
                <>
                  <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Matrícula Global</h3>
                  <p className="text-slate-500 text-sm mb-8">Vas a vincular a {selectedIds.length} estudiantes al siguiente año académico:</p>
                  <select 
                    value={targetYearId} 
                    onChange={e => setTargetYearId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-lg mb-8 outline-none ring-2 ring-primary/10 text-black"
                  >
                    {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveBulkAction(null)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                    <button onClick={handleBulkEnroll} disabled={isProcessing} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-primary-hover flex items-center justify-center gap-2">
                       {isProcessing && <Loader2 size={14} className="animate-spin" />} Vincular Ahora
                    </button>
                  </div>
                </>
              )}

              {activeBulkAction === 'promote' && (
                <>
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 text-black">Promoción de Nivel</h3>
                  <p className="text-slate-500 text-sm mb-8">Esta acción avanzará a {selectedIds.length} seeds a la siguiente letra de nivel académico (C → D → E ... → N).</p>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mb-8">
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-tight">El grado (1°, 2°, etc.) se sincronizará automáticamente con la nueva letra de nivel.</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveBulkAction(null)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                    <button onClick={handleBulkPromote} disabled={isProcessing} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-green-700 flex items-center justify-center gap-2">
                       {isProcessing && <Loader2 size={14} className="animate-spin" />} Confirmar Promoción
                    </button>
                  </div>
                </>
              )}

              {activeBulkAction === 'retire' && (
                <>
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                    <UserX size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 text-black">Retiro Masivo</h3>
                  <p className="text-slate-500 text-sm mb-6">Procesarás el retiro institucional de {selectedIds.length} estudiantes.</p>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Motivo</label>
                      <select 
                        value={retireData.reason}
                        onChange={e => setRetireData({...retireData, reason: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold text-sm text-black"
                      >
                        <option>Retiro Voluntario</option>
                        <option>Retiro Académico</option>
                        <option>Graduado / Egresado</option>
                        <option>Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Observaciones</label>
                      <textarea 
                        value={retireData.obs}
                        onChange={e => setRetireData({...retireData, obs: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-xl font-medium text-sm text-black h-24 resize-none"
                        placeholder="Contexto del retiro..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setActiveBulkAction(null)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                    <button onClick={handleBulkRetire} disabled={isProcessing} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-rose-700 flex items-center justify-center gap-2">
                       {isProcessing && <Loader2 size={14} className="animate-spin" />} Ejecutar Retiro
                    </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
