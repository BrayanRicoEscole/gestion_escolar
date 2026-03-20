
import React, { useState } from 'react';
import { Search, User, BookOpen, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Loader2, Copy } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { useGrowerStatus } from '../../hooks/useGrowerStatus';

export const GrowersTab: React.FC = () => {
  const { growerStatuses, isLoading, currentStation, searchTerm, setSearchTerm } = useGrowerStatus();
  const [expandedGrower, setExpandedGrower] = useState<string | null>(null);

  const filteredGrowers = growerStatuses.filter(status => 
    status.grower.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.assignments.some(a => a.assignment.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopyPending = (status: any) => {
    const pendingText = status.assignments
      .filter((a: any) => a.pendingStudents.length > 0)
      .map((a: any) => {
        return `*${a.assignment.subject_name}*:\n${a.pendingStudents.map((s: string) => `- ${s}`).join('\n')}`;
      })
      .join('\n\n');
    
    if (!pendingText) return;
    
    const fullText = `Pendientes de ${status.grower.full_name}:\n\n${pendingText}`;
    navigator.clipboard.writeText(fullText);
    alert('Lista de pendientes copiada al portapapeles');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculando estados de Growers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <Card className="flex flex-wrap items-center gap-6" padding="sm">
        <div className="flex items-center gap-4 border-r pr-6">
          <User size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado de Growers</span>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar Grower o Asignatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold"
          />
        </div>

        <div className="ml-auto flex items-center gap-8">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Growers</p>
            <p className="text-xl font-black text-slate-900">{growerStatuses.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Completados</p>
            <p className="text-xl font-black text-green-500">{growerStatuses.filter(g => g.isComplete).length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Pendientes</p>
            <p className="text-xl font-black text-amber-500">{growerStatuses.filter(g => !g.isComplete).length}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredGrowers.map((status) => (
          <div 
            key={status.grower.id}
            className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${
              expandedGrower === status.grower.id ? 'border-primary/20 shadow-lg' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div 
              className="p-6 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedGrower(expandedGrower === status.grower.id ? null : status.grower.id)}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${
                  status.isComplete ? 'bg-green-500' : 'bg-slate-900'
                }`}>
                  {status.grower.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{status.grower.full_name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status.assignments.length} Asignaciones</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.isComplete ? 'text-green-500' : 'text-amber-500'}`}>
                      {status.isComplete ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso Global</span>
                    <span className={`text-sm font-black ${status.isComplete ? 'text-green-500' : 'text-primary'}`}>
                      {status.overallProgress}%
                    </span>
                  </div>
                  <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${status.isComplete ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${status.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!status.isComplete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPending(status);
                      }}
                      className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
                      title="Copiar lista de pendientes"
                    >
                      <Copy size={18} />
                      <span className="text-[8px] font-black uppercase tracking-widest hidden lg:inline">Copiar pendientes</span>
                    </button>
                  )}
                  {expandedGrower === status.grower.id ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                </div>
              </div>
            </div>

            {expandedGrower === status.grower.id && (
              <div className="px-6 pb-8 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {status.assignments.map((a, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <BookOpen size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">{a.assignment.subject_name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                              {a.assignment.academic_level} • {a.assignment.course}
                            </p>
                          </div>
                        </div>
                        {a.progress === 100 ? (
                          <CheckCircle size={18} className="text-green-500" />
                        ) : (
                          <AlertCircle size={18} className="text-amber-500" />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Estudiantes</span>
                          <span className="text-[10px] font-black text-slate-700">
                            {a.gradedStudents} / {a.totalStudents}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className={`h-full transition-all duration-500 ${a.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${a.progress}%` }}
                          ></div>
                        </div>
                        
                        {a.pendingStudents.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Pendientes ({a.pendingStudents.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {a.pendingStudents.slice(0, 5).map((name, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[8px] font-bold text-slate-500">
                                  {name}
                                </span>
                              ))}
                              {a.pendingStudents.length > 5 && (
                                <span className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[8px] font-bold text-slate-400">
                                  +{a.pendingStudents.length - 5} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
