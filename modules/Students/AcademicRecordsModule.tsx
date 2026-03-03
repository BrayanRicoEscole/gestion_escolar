
import React, { useState } from 'react';
import { 
  History, Search, Filter, Download, Upload, Plus, 
  Edit2, Trash2, ChevronRight, Loader2, AlertCircle,
  FileDown, FileUp, Database
} from 'lucide-react';
import { useAcademicRecords } from './hooks/useAcademicRecords';
import { exportRecordsToCSV } from './utils/exportRecordsCSV';
import { AcademicRecord } from '../../types';
import { updateAcademicRecord, syncAcademicRecordsFromCSV } from '../../services/api';
import { EditHistoryForm } from './components/StudentModal/EditHistoryForm';
import { parseCSV } from './utils/parseCSV';

export const AcademicRecordsModule: React.FC = () => {
  const { records, loading, years, filters, setFilters, refetch } = useAcademicRecords();
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{success: number, errors: number} | null>(null);

  const stats = React.useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcoming = records.filter(r => {
      if (!r.end_date || r.end_date === 'N/A') return false;
      const d = new Date(r.end_date);
      return d >= today && d <= thirtyDaysFromNow;
    });

    const pendingReports = upcoming.filter(r => !r.final_report_sent);

    return {
      upcomingCount: upcoming.length,
      pendingReportsCount: pendingReports.length
    };
  }, [records]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const data = parseCSV(text);
        const mapped = data.map((row: any) => ({
          student_id: row['ID Estudiante'],
          school_year_id: row['ID Año'],
          grade: row['Grado'],
          academic_level: row['Nivel Académico'],
          atelier: row['Atelier'],
          modality: row['Modalidad'],
          status: row['Estado'],
          start_date: row['Fecha Inicio'],
          end_date: row['Fecha Fin'],
          observations: row['Observaciones']
        })).filter(r => r.student_id && r.school_year_id);

        await syncAcademicRecordsFromCSV(mapped);
        setImportStatus({ success: mapped.length, errors: 0 });
        refetch();
      } catch (error) {
        console.error("Error importing records:", error);
        setImportStatus({ success: 0, errors: 1 });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 text-black">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <Database size={32} />
              </div>
              Configuración periodo académico
           </h1>
           <p className="text-slate-500 font-medium mt-2">Visualiza y gestiona todos los registros académicos de la institución</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 shadow-sm cursor-pointer">
            <FileUp size={14} className="text-indigo-600" />
            {isImporting ? 'Importando...' : 'Importar CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isImporting} />
          </label>
          
          <button 
            onClick={() => exportRecordsToCSV(records)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 shadow-sm"
          >
            <FileDown size={14} className="text-indigo-600" /> Exportar CSV
          </button>
        </div>
      </header>

      {importStatus && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 ${importStatus.errors > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div className="flex items-center gap-3">
            {importStatus.errors > 0 ? <AlertCircle size={20} /> : <History size={20} />}
            <span className="text-xs font-black uppercase tracking-widest">
              {importStatus.errors > 0 ? 'Error en la importación' : `Importación exitosa: ${importStatus.success} registros procesados`}
            </span>
          </div>
          <button onClick={() => setImportStatus(null)} className="p-1 hover:bg-black/5 rounded-lg transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Alertas Rápidas */}
      {stats.upcomingCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <History size={32} />
            </div>
            <div>
              <h3 className="text-amber-900 font-black text-xl tracking-tight">{stats.upcomingCount} Estudiantes</h3>
              <p className="text-amber-700/70 font-bold text-sm">Finalizan periodo en los próximos 30 días</p>
            </div>
            <button 
              onClick={() => setFilters({...filters, upcomingEnd: true})}
              className="ml-auto px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md"
            >
              Ver Todos
            </button>
          </div>

          {stats.pendingReportsCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-rose-900 font-black text-xl tracking-tight">{stats.pendingReportsCount} Reportes Finales</h3>
                <p className="text-rose-700/70 font-bold text-sm">Pendientes por enviar para el cierre de año</p>
              </div>
              <button 
                onClick={() => setFilters({...filters, upcomingEnd: true, finalReportSent: 'false'})}
                className="ml-auto px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md"
              >
                Atender
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre, documento o año..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-medium text-slate-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-black"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select 
              value={filters.schoolYearId}
              onChange={e => setFilters({...filters, schoolYearId: e.target.value})}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-indigo-600/20 text-black"
            >
              <option value="">Todos los Años</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>

            <select 
              value={filters.academicLevel}
              onChange={e => setFilters({...filters, academicLevel: e.target.value})}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-indigo-600/20 text-black"
            >
              <option value="">Todos los Niveles</option>
              {['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select 
              value={filters.atelier}
              onChange={e => setFilters({...filters, atelier: e.target.value})}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-indigo-600/20 text-black"
            >
              <option value="">Todos los Ateliers</option>
              <option value="Alhambra">Alhambra (A)</option>
              <option value="Casa">Casa (C)</option>
              <option value="Mandalay">Mandalay (MS)</option>
              <option value="Mónaco">Mónaco (M)</option>
            </select>

            <select 
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-indigo-600/20 text-black"
            >
              <option value="">Todos los Estados</option>
              <option value="Matriculado">Matriculado</option>
              <option value="Promovido">Promovido</option>
              <option value="Retiro Voluntario">Retiro Voluntario</option>
              <option value="Retiro Académico">Retiro Académico</option>
              <option value="Graduado">Graduado</option>
            </select>

            <button
              onClick={() => setFilters({...filters, missingDates: !filters.missingDates, upcomingEnd: false})}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                filters.missingDates 
                ? 'bg-rose-600 text-white border-rose-600 shadow-lg' 
                : 'bg-slate-50 text-slate-500 border-transparent'
              }`}
            >
              {filters.missingDates ? 'Sin Fechas / NA' : 'Filtrar Sin Fechas'}
            </button>

            <button
              onClick={() => setFilters({...filters, upcomingEnd: !filters.upcomingEnd, missingDates: false})}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                filters.upcomingEnd 
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg' 
                : 'bg-slate-50 text-slate-500 border-transparent'
              }`}
            >
              {filters.upcomingEnd ? 'Próximos a Finalizar' : 'Filtrar Cierres'}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 w-full">
            <p className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filtros de Reportes Enviados</p>
            {[
              { key: 'springSent', label: 'Spring' },
              { key: 'winterSent', label: 'Winter' },
              { key: 'autumnSent', label: 'Autumn' },
              { key: 'summerSent', label: 'Summer' },
              { key: 'finalReportSent', label: 'Final Report' }
            ].map(report => (
              <select
                key={report.key}
                value={(filters as any)[report.key]}
                onChange={e => setFilters({...filters, [report.key]: e.target.value})}
                className="px-4 py-3 bg-slate-50 border-none rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-indigo-600/20 text-black"
              >
                <option value="">{report.label}: Todos</option>
                <option value="true">{report.label}: Enviado</option>
                <option value="false">{report.label}: No Enviado</option>
              </select>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estudiante</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Año Escolar</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel / Grado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Atelier</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Reportes (S/W/A/S/F)</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fechas</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando registros académicos...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No se encontraron registros con los filtros seleccionados</p>
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                          {record.student_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight text-black">{record.student_name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {record.student_document}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">
                        {record.school_year_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black text-slate-600">{record.academic_level}</span>
                        <span className="text-xs font-bold text-slate-600">Grado {record.grade}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600">{record.atelier}</p>
                      <p className="text-[10px] font-medium text-slate-400">{record.modality}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        record.status?.toLowerCase().includes('promovido') ? 'bg-green-50 text-green-600' :
                        record.status?.toLowerCase().includes('retiro') ? 'bg-rose-50 text-rose-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1">
                        {[
                          { val: record.spring_sent, label: 'S' },
                          { val: record.winter_sent, label: 'W' },
                          { val: record.autumn_sent, label: 'A' },
                          { val: record.summer_sent, label: 'S' },
                          { val: record.final_report_sent, label: 'F' }
                        ].map((r, i) => (
                          <div 
                            key={i}
                            title={r.label}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                              r.val ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {r.label}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">I: {record.start_date || 'N/A'}</p>
                        <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                          record.end_date && record.end_date !== 'N/A' && 
                          new Date(record.end_date) >= new Date() && 
                          new Date(record.end_date) <= new Date(new Date().setDate(new Date().getDate() + 30))
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'text-slate-500'
                        }`}>
                          F: {record.end_date || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setEditingRecord(record)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRecord && (
        <EditHistoryForm 
          record={editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSuccess={() => {
            setEditingRecord(null);
            refetch();
          }} 
        />
      )}
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
