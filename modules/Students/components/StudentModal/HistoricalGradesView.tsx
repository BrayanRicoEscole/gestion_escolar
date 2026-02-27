import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Layers, Star, Info } from 'lucide-react';
import { Student, SchoolYear, GradeEntry, LevelingGrade } from 'types';
import { getSchoolYear } from '../../../../services/api/schoolYear.api';
import { supabase } from '../../../../services/api/client';

interface Props {
  student: Student;
  schoolYearId: string;
  schoolYearName: string;
  academicLevel?: string;
  onBack: () => void;
}

export const HistoricalGradesView: React.FC<Props> = ({ student, schoolYearId, schoolYearName, academicLevel, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [yearStructure, setYearStructure] = useState<SchoolYear | null>(null);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [leveling, setLeveling] = useState<LevelingGrade[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Estructura del año
        const structure = await getSchoolYear(schoolYearId);
        
        // Filtrar materias por nivel académico si se proporciona
        if (academicLevel && structure) {
          const levelChar = academicLevel.charAt(0).toUpperCase();
          structure.stations = structure.stations.map(station => ({
            ...station,
            subjects: station.subjects.filter(sub => 
              !sub.levels || sub.levels.length === 0 || sub.levels.some(l => l.charAt(0).toUpperCase() === levelChar)
            )
          }));
        }

        setYearStructure(structure);

        // 2. Notas del estudiante (Query directa para optimizar)
        const { data: gradesData } = await supabase
          .from('grades')
          .select('subject_id, value, slot_id')
          .eq('student_id', student.id);
        
        const { data: levelingData } = await supabase
          .from('leveling_grades')
          .select('subject_id, station_id, value')
          .eq('student_id', student.id);

        setGrades((gradesData || []).map(g => ({
          studentId: student.id!,
          slotId: g.slot_id,
          subjectId: g.subject_id,
          value: g.value
        })));

        setLeveling((levelingData || []).map(l => ({
          studentId: student.id!,
          subjectId: l.subject_id,
          stationId: l.station_id,
          value: l.value
        })));

      } catch (error) {
        console.error("Error fetching historical grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student.id, schoolYearId]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recuperando archivo de calificaciones {schoolYearName}...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-8 hover:gap-3 transition-all"
      >
        <ArrowLeft size={16} /> Volver al Historial
      </button>

      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reporte de Calificaciones</h3>
          <p className="text-slate-500 font-bold text-sm">Ciclo Escolar: {schoolYearName}</p>
        </div>
        <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl border border-primary/20">
          <span className="text-[10px] font-black uppercase tracking-widest block opacity-60">Estudiante</span>
          <span className="text-sm font-black">{student.full_name}</span>
        </div>
      </div>

      <div className="space-y-16">
        {yearStructure?.stations.map(station => (
          <div key={station.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Layers size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">{station.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Peso en el año: {station.weight}%</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 gap-8">
                {station.subjects.map(subject => {
                  // Calcular promedio de la materia en esta estación
                  const subjectGrades = grades.filter(g => g.subjectId === subject.id);
                  const levelingGrade = leveling.find(l => l.subjectId === subject.id && l.stationId === station.id);
                  
                  // Obtener slots de esta estación para esta materia
                  // Nota: Los slots están en moments -> sections -> slots
                  const allSlotsInStation = station.moments.flatMap(m => 
                    m.sections.flatMap(s => s.gradeSlots)
                  );
                  
                  // Filtrar notas que pertenecen a esta estación
                  const stationGrades = subjectGrades.filter(g => 
                    allSlotsInStation.some(slot => slot.id === g.slotId)
                  );

                  // Cálculo de promedio (simplificado para vista histórica)
                  let average = 0;
                  if (stationGrades.length > 0) {
                    const sum = stationGrades.reduce((acc, g) => acc + (g.value || 0), 0);
                    average = sum / stationGrades.length;
                  }
                  
                  // Si hay nivelación, prevalece si es mayor
                  const finalValue = levelingGrade?.value !== null && levelingGrade?.value !== undefined
                    ? Math.max(average, levelingGrade.value)
                    : average;

                  return (
                    <div key={subject.id} className="group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{subject.name}</p>
                            <p className="text-[9px] font-bold uppercase text-slate-400">{subject.area}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {levelingGrade && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                              <Star size={10} fill="currentColor" />
                              <span className="text-[10px] font-black">Niv: {levelingGrade.value}</span>
                            </div>
                          )}
                          <div className={`px-4 py-2 rounded-xl font-black text-sm ${finalValue >= 3.5 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                            {finalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Detalle de notas por momento si existen */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-11">
                        {station.moments.map(moment => {
                          const momentSlots = moment.sections.flatMap(s => s.gradeSlots);
                          const momentGrades = stationGrades.filter(g => momentSlots.some(ms => ms.id === g.slotId));
                          
                          if (momentGrades.length === 0) return null;

                          return (
                            <div key={moment.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1 truncate">{moment.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {momentGrades.map((mg, i) => (
                                  <span key={i} className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    {mg.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4 items-start">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs text-blue-700 font-medium leading-relaxed">
          Los promedios mostrados son cálculos referenciales basados en los registros históricos. 
          Si existe una nota de nivelación, esta se muestra por separado y se aplica al promedio final de la materia en la estación correspondiente.
        </p>
      </div>
    </div>
  );
};
