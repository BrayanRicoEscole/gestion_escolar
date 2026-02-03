
import React, { useState } from 'react';
import {
  Search,
  Save,
  CheckCircle,
  Filter,
  Loader2,
  Clock,
  Unlock
} from 'lucide-react';
import { useGrading } from '../../hooks/useGrading';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const TeacherGradingView: React.FC = () => {
  const grading = useGrading();

  const {
    isLoading = true,
    schoolYear = null,
    currentStation = null,
    filteredStudents = [],
    selectedStationId = '',
    setSelectedStationId = () => {},
    selectedSubjectId = '',
    setSelectedSubjectId = () => {},
    selectedCourse = '',
    setSelectedCourse = () => {},
    searchTerm = '',
    setSearchTerm = () => {},
    isSaving = false,
    handleGradeChange = () => {},
    getGradeValue = () => '',
    // Fix: changed property name from saveGrades to handlesaveGrades to match useGrading hook return type
    handlesaveGrades = async () => false
  } = grading ?? {};

  const [saveSuccess, setSaveSuccess] = useState(false);

  const onSave = async () => {
    // Fix: call handlesaveGrades instead of non-existent saveGrades
    const success = await handlesaveGrades();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (isLoading || !schoolYear || !currentStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Accediendo al Registro...
        </p>
      </div>
    );
  }

  // Helper to filter slots by selected subject: 
  // Mostramos solo las notas que pertenecen a esta materia específica o las globales (sin subjectId)
  const getSubjectSlots = (section: any) => {
    return (section.gradeSlots || []).filter((slot: any) => 
      !slot.subjectId || slot.subjectId === selectedSubjectId
    );
  };

  const currentSubject = currentStation.subjects?.find(s => s.id === selectedSubjectId);
  const currentSubjectName = currentSubject?.name || 'Sin materia';

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-40 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Unlock size={12} /> Registro Abierto
            </div>
            <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> Gestión 2026
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            Libro de Calificaciones
          </h1>
          <p className="text-slate-500 font-medium">
            Materia Seleccionada: <span className="text-primary font-bold">
              {currentSubjectName}
            </span>
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {saveSuccess && (
            <span className="text-green-600 font-bold text-sm flex items-center gap-2">
              <CheckCircle size={20} /> ¡Sincronizado!
            </span>
          )}
          <Button onClick={onSave} loading={isSaving} icon={Save} size="lg">
            Sincronizar Notas
          </Button>
        </div>
      </header>

      <Card className="flex flex-wrap items-center gap-6 mb-8" padding="sm">
        <div className="flex items-center gap-4 border-r pr-6">
          <Filter size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Filtros
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 max-w-4xl">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5"
          >
            {schoolYear.stations?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5"
          >
            {currentStation.subjects?.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2.5"
          >
            {currentStation.subjects
              ?.find((s) => s.id === selectedSubjectId)
              ?.courses?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[300px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium"
          />
        </div>
      </Card>

      <div className="bg-white rounded-5xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-6 sticky left-0 z-10 bg-primary min-w-[280px]">
                Estudiante
              </th>

              {currentStation.moments?.map((moment) => {
                const momentSlots = moment.sections?.reduce(
                  (acc, sec) => [...acc, ...getSubjectSlots(sec)],
                  [] as any[]
                ) ?? [];

                if (momentSlots.length === 0) return null;

                return (
                  <th
                    key={`${moment.id}-${selectedSubjectId}`}
                    className="p-0 border-l border-white/10"
                    colSpan={momentSlots.length}
                  >
                    <div className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5">
                      {moment.name?.split('/')[0]}
                    </div>
                    <div className="flex border-t border-white/10">
                      {moment.sections?.map((section) => {
                        const secSlots = getSubjectSlots(section);
                        if (secSlots.length === 0) return null;
                        
                        return (
                          <div
                            key={`${section.id}-${selectedSubjectId}`}
                            className="border-r border-white/10 flex"
                          >
                            {secSlots.map((slot) => (
                              <div
                                key={`${slot.id}-${selectedSubjectId}`}
                                className="w-20 text-center py-2 text-[8px] font-black text-blue-200"
                              >
                                {slot.name?.substring(0, 10)}..
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </th>
                );
              })}

              <th className="p-6 text-center text-[10px] font-black uppercase border-l border-white/10">
                Def.
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <tr
                key={`${student.id}-${selectedSubjectId}`}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="p-6 sticky left-0 z-10 bg-white border-r border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center font-black text-xs">
                      {student.full_name?.charAt(0)}
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      {student.full_name}
                    </p>
                  </div>
                </td>

                {currentStation.moments?.map((moment) =>
                  moment.sections?.map((section) => {
                    const slots = getSubjectSlots(section);
                    return slots.map((slot) => (
                      <td
                        key={`${student.id}-${slot.id}-${selectedSubjectId}`}
                        className="p-2 border-r border-slate-50 w-20"
                      >
                        <input
                          type="number"
                          step="0.1"
                          value={getGradeValue(student.id, slot.id, selectedSubjectId) ?? ''}
                          onChange={(e) => {
                            handleGradeChange(
                              student.id,
                              slot.id,
                              selectedSubjectId,
                              e.target.value
                            );
                          }}
                          className="w-full text-center py-2 rounded-xl text-sm font-black border-2 border-slate-100 focus:border-secondary outline-none transition-all"
                        />
                      </td>
                    ));
                  })
                )}

                <td className="p-6 text-center font-black text-primary bg-blue-50/30 border-l">
                  0.0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherGradingView;
