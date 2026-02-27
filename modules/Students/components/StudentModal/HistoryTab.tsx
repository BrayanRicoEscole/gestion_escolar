import React, { useState, useEffect } from 'react';
import { Clock, History, BookOpen, ArrowRight, Edit2 } from 'lucide-react';
import { Student, AcademicRecord } from 'types';
import { getStudentAcademicHistory } from '../../../../services/api';
import { HistoricalGradesView } from './HistoricalGradesView';
import { EditHistoryForm } from './EditHistoryForm';

interface HistoryTabProps {
  student: Student;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ student }) => {
  const [history, setHistory] = useState<AcademicRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);

  const fetchHistory = async () => {
    if (student.id) {
      setLoadingHistory(true);
      const data = await getStudentAcademicHistory(student.id);
      setHistory(data);
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [student.id]);

  if (selectedRecord) {
    return (
      <HistoricalGradesView 
        student={student}
        schoolYearId={selectedRecord.school_year_id}
        schoolYearName={selectedRecord.school_year_name || 'N/A'}
        academicLevel={selectedRecord.academic_level}
        atelier={selectedRecord.atelier}
        onBack={() => setSelectedRecord(null)}
      />
    );
  }

  return (
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">{record.school_year_name}</span>
                      <span className="text-sm font-black text-slate-800 tracking-tight">Grado {record.grade} ({record.academic_level})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingRecord(record)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Editar Registro"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        <BookOpen size={14} /> Ver Notas <ArrowRight size={12} />
                      </button>
                    </div>
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

      {editingRecord && (
        <EditHistoryForm 
          record={editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSuccess={() => {
            setEditingRecord(null);
            fetchHistory();
          }} 
        />
      )}
    </div>
  );
};
