
import React from 'react';
import { X, Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student, SchoolYear, StationReport, StudentComment, Station, Subject } from '../../../../types';
import { isSubjectRelevant } from '../../../../services/api/schoolYear.api';

interface Props {
  student: Student;
  schoolYear: SchoolYear;
  reports: StationReport[];
  comments: StudentComment[];
  onClose: () => void;
}

export const YearlySummaryModal: React.FC<Props> = ({
  student,
  schoolYear,
  reports,
  comments,
  onClose
}) => {
  const [stationFilter, setStationFilter] = React.useState<'all' | 'past'>('all');

  // Helper to check if a subject is relevant for the student

  // Get all unique relevant subjects across all reports
  const allSubjectsMap = new Map<string, { id: string, name: string }>();
  reports.forEach(report => {
    const station = schoolYear.stations.find(s => s.id === report.station_id);
    if (station) {
      station.subjects.forEach(sub => {
        if (isSubjectRelevant(student, sub)) {
          allSubjectsMap.set(sub.id, { id: sub.id, name: sub.name });
        }
      });
    }
  });

  const subjects = Array.from(allSubjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredStations = schoolYear.stations.filter(station => {
    if (stationFilter === 'past') {
      return new Date(station.endDate) < new Date();
    }
    return true;
  });

  const stations = filteredStations;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">{student.full_name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider text-white/60">{student.academic_level} - {student.atelier}</span>
                <span className="text-[9px] font-black bg-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider text-indigo-300">Inicio: {student.start_date || '—'}</span>
                <span className="text-[9px] font-black bg-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider text-red-300">Cierre: {student.end_date || '—'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 p-2 px-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-white/60">Estaciones:</span>
              <select 
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value as any)}
                className="bg-transparent border-none text-xs font-black uppercase text-white outline-none cursor-pointer"
              >
                <option value="all" className="text-slate-900">Todas</option>
                <option value="past" className="text-slate-900">Cerradas (Pasadas)</option>
              </select>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] sticky left-0 bg-slate-900 z-20">Asignatura</th>
                  {stations.map(station => (
                    <th key={station.id} className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800">
                      {station.name}
                    </th>
                  ))}
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-center border-l border-slate-800 bg-indigo-900">Final</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => {
                  let yearlySum = 0;
                  let yearlyWeightSum = 0;

                  return (
                    <tr key={subject.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100">
                        {subject.name}
                      </td>
                      {stations.map(station => {
                        const report = reports.find(r => r.station_id === station.id);
                        const data = report?.subject_data[subject.id];
                        const val = data?.value;

                        // Check if student was active during this station
                        const stationStart = new Date(station.startDate);
                        const stationEnd = new Date(station.endDate);
                        let isInactive = false;
                        
                        if (student.start_date) {
                          const studentStart = new Date(student.start_date);
                          if (studentStart > stationEnd) isInactive = true;
                        }
                        
                        if (student.end_date) {
                          const studentEnd = new Date(student.end_date);
                          if (studentEnd < stationStart) isInactive = true;
                        }

                        if (!isInactive && val !== undefined && val !== null && val > 0) {
                          yearlySum += val * (station.weight / 100);
                          yearlyWeightSum += (station.weight / 100);
                        }

                        return (
                          <td key={station.id} className="p-4 text-center border-l border-slate-50">
                            {isInactive ? (
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No vinculado</span>
                            ) : (
                              <span className={`font-black ${val && val < 3.7 ? 'text-red-600' : 'text-slate-600'}`}>
                                {val !== undefined && val !== null && val > 0 ? val.toFixed(2) : '—'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center border-l border-slate-50 bg-indigo-50/30">
                        <span className={`font-black ${yearlyWeightSum > 0 && (yearlySum / yearlyWeightSum) < 3.7 ? 'text-red-600' : 'text-indigo-700'}`}>
                          {yearlyWeightSum > 0 ? (yearlySum / yearlyWeightSum).toFixed(2) : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Convivencia Row */}
                <tr className="bg-slate-900 text-white">
                  <td className="p-4 font-black uppercase tracking-widest text-[10px] sticky left-0 bg-slate-900 z-20">
                    🤝 Convivencia
                  </td>
                  {stations.map(station => {
                    const comment = comments.find(c => c.stationId === station.id);
                    const val = comment?.convivenciaGrade;

                    // Check if student was active during this station
                    const stationStart = new Date(station.startDate);
                    const stationEnd = new Date(station.endDate);
                    let isInactive = false;
                    
                    if (student.start_date) {
                      const studentStart = new Date(student.start_date);
                      if (studentStart > stationEnd) isInactive = true;
                    }
                    
                    if (student.end_date) {
                      const studentEnd = new Date(student.end_date);
                      if (studentEnd < stationStart) isInactive = true;
                    }

                    return (
                      <th key={station.id} className="p-4 font-black text-center border-l border-slate-800">
                        {isInactive ? (
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">No vinculado</span>
                        ) : (
                          val !== undefined && val !== null && val > 0 ? val.toFixed(2) : '—'
                        )}
                      </th>
                    );
                  })}
                  <th className="p-4 font-black text-center border-l border-slate-800 bg-indigo-900">
                    {comments.filter(c => {
                      const station = stations.find(s => s.id === c.stationId);
                      if (!station) return false;
                      const stationStart = new Date(station.startDate);
                      const stationEnd = new Date(station.endDate);
                      
                      if (student.start_date && new Date(student.start_date) > stationEnd) return false;
                      if (student.end_date && new Date(student.end_date) < stationStart) return false;
                      
                      return (c.convivenciaGrade || 0) > 0;
                    }).length > 0
                      ? (comments.reduce((acc, c) => {
                          const station = stations.find(s => s.id === c.stationId);
                          if (!station) return acc;
                          const stationStart = new Date(station.startDate);
                          const stationEnd = new Date(station.endDate);
                          
                          if (student.start_date && new Date(student.start_date) > stationEnd) return acc;
                          if (student.end_date && new Date(student.end_date) < stationStart) return acc;
                          
                          return acc + (c.convivenciaGrade || 0);
                        }, 0) / comments.filter(c => {
                          const station = stations.find(s => s.id === c.stationId);
                          if (!station) return false;
                          const stationStart = new Date(station.startDate);
                          const stationEnd = new Date(station.endDate);
                          
                          if (student.start_date && new Date(student.start_date) > stationEnd) return false;
                          if (student.end_date && new Date(student.end_date) < stationStart) return false;
                          
                          return (c.convivenciaGrade || 0) > 0;
                        }).length).toFixed(2)
                      : '—'}
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    </div>
  );
};
