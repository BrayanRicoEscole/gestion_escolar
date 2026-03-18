
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Trash2, Loader2, Search, Filter, 
  BookOpen, Layers, School, ChevronRight, AlertCircle,
  UserCog, GraduationCap, MapPin, Plus, Users, CheckCircle2
} from 'lucide-react';
import { 
  getAllUserProfiles, 
  getSchoolYear, 
  getSchoolYearsList,
  getGrowerAssignments,
  createGrowerAssignment,
  createGrowerAssignments,
  deleteGrowerAssignment
} from '../../services/api';
import { UserProfile, SchoolYear, GrowerAssignment, Station, Subject } from '../../types';

export const GrowerAssignmentsModule: React.FC = () => {
  const [assignments, setAssignments] = useState<GrowerAssignment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [schoolYears, setSchoolYears] = useState<{id: string, name: string}[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Filters state
  const [filterYearId, setFilterYearId] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStationId, setFilterStationId] = useState('all');
  const [filterGrowerId, setFilterGrowerId] = useState('all');
  
  // Form state
  const [newAssignment, setNewAssignment] = useState({
    grower_id: '',
    station_id: '',
    subject_id: '',
    academic_level: 'Elementary',
    atelier: 'Atelier Casa (C)',
    courses: [] as string[]
  });

  const LEVEL_MAP: Record<string, string[]> = {
    'Petiné': ['C'],
    'Elementary': ['D', 'E', 'F', 'G'],
    'Middle': ['H', 'I', 'J', 'K'],
    'Highschool': ['L', 'M', 'N']
  };

  const getSuffix = (atelier: string) => {
    const match = atelier.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  };

  const fetchData = async () => {
    setLoading(true);
    console.log("[GrowerAssignments] 📥 Iniciando carga de datos...");
    try {
      const [profiles, years, currentAssignments] = await Promise.all([
        getAllUserProfiles(),
        getSchoolYearsList(),
        getGrowerAssignments()
      ]);
      
      console.log("[GrowerAssignments] ✅ Datos recibidos:", {
        profilesCount: profiles.length,
        yearsCount: years.length,
        assignmentsCount: currentAssignments.length
      });

      const growers = profiles.filter(u => u.role === 'grower');
      console.log("[GrowerAssignments] 👥 Growers filtrados:", growers.length);

      setUsers(growers);
      setSchoolYears(years);
      setAssignments(currentAssignments);
      
      if (years.length > 0) {
        setSelectedYearId(years[0].id);
      }
    } catch (error) {
      console.error("[GrowerAssignments] ❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      getSchoolYear(selectedYearId).then(setSchoolYear);
    }
  }, [selectedYearId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.grower_id || !newAssignment.station_id || !newAssignment.subject_id || newAssignment.courses.length === 0) {
      alert("Por favor completa todos los campos y selecciona al menos un curso");
      return;
    }

    setSaving(true);
    try {
      const assignmentsToCreate = newAssignment.courses.map(course => ({
        grower_id: newAssignment.grower_id,
        station_id: newAssignment.station_id,
        subject_id: newAssignment.subject_id,
        academic_level: newAssignment.academic_level,
        atelier: newAssignment.atelier,
        course: course
      }));

      await createGrowerAssignments(assignmentsToCreate);
      const updated = await getGrowerAssignments();
      setAssignments(updated);
      setNewAssignment(prev => ({ ...prev, courses: [] }));
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert("Error al crear las asignaciones. Es posible que algunas ya existan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta asignación?")) return;
    
    try {
      await deleteGrowerAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (filterYearId !== 'all' && a.school_year_id !== filterYearId) return false;
      if (filterLevel !== 'all' && a.academic_level !== filterLevel) return false;
      if (filterStationId !== 'all' && a.station_id !== filterStationId) return false;
      if (filterGrowerId !== 'all' && a.grower_id !== filterGrowerId) return false;
      return true;
    });
  }, [assignments, filterYearId, filterLevel, filterStationId, filterGrowerId]);

  // Derive unique stations from filtered year or all assignments
  const filterStations = useMemo(() => {
    const stationsMap = new Map<string, string>();
    assignments.forEach(a => {
      if (filterYearId === 'all' || a.school_year_id === filterYearId) {
        if (a.station_id && a.station_name) {
          stationsMap.set(a.station_id, a.station_name);
        }
      }
    });
    return Array.from(stationsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments, filterYearId]);

  const currentStations = schoolYear?.stations || [];
  const selectedStation = currentStations.find(s => s.id === newAssignment.station_id);
  const currentSubjects = selectedStation?.subjects || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cargando Asignaciones...</p>
      </div>
    );
  }

  const hasNoYears = schoolYears.length === 0;
  const hasNoGrowers = users.length === 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-40">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 text-black">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <UserCog size={32} />
              </div>
              Asignación Académica (Growers)
           </h1>
           <p className="text-slate-500 font-medium mt-2">Gestiona las responsabilidades de cada Grower por estación, nivel y atelier</p>
        </div>
      </header>

      {(hasNoYears || hasNoGrowers) && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-top-4">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-amber-900 font-black text-lg uppercase tracking-tight">Configuración Requerida</h3>
            <p className="text-amber-700/80 font-medium text-sm leading-relaxed">
              Para crear asignaciones, necesitas tener al menos un <strong>Año Escolar</strong> creado y usuarios registrados con el rol de <strong>Grower</strong>.
            </p>
            <div className="flex gap-4 mt-4">
              {hasNoYears && (
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                  <School size={14} /> Falta Año Escolar
                </div>
              )}
              {hasNoGrowers && (
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                  <Users size={14} /> Falta Usuarios Grower
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Creación */}
        <div className="lg:col-span-1">
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${ (hasNoYears || hasNoGrowers) ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-600" />
                Nueva Asignación
              </h2>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Año Escolar</label>
                <select 
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                >
                  <option value="">Seleccionar Año...</option>
                  {schoolYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grower</label>
                <select 
                  value={newAssignment.grower_id}
                  onChange={(e) => setNewAssignment({...newAssignment, grower_id: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                >
                  <option value="">Seleccionar Grower...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estación</label>
                <select 
                  value={newAssignment.station_id}
                  onChange={(e) => setNewAssignment({...newAssignment, station_id: e.target.value, subject_id: ''})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                  disabled={!selectedYearId}
                >
                  <option value="">Seleccionar Estación...</option>
                  {currentStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Materia</label>
                <select 
                  value={newAssignment.subject_id}
                  onChange={(e) => setNewAssignment({...newAssignment, subject_id: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                  disabled={!newAssignment.station_id}
                >
                  <option value="">Seleccionar Materia...</option>
                  {currentSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nivel Académico</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Petiné', 'Elementary', 'Middle', 'Highschool'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewAssignment({...newAssignment, academic_level: level})}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        newAssignment.academic_level === level
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Atelier</label>
                <select 
                  value={newAssignment.atelier}
                  onChange={(e) => setNewAssignment({...newAssignment, atelier: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                >
                  <option value="Atelier Alhambra (A)">Alhambra (A)</option>
                  <option value="Atelier Casa (C)">Casa (C)</option>
                  <option value="Atelier Mandalay (MS)">Mandalay (MS)</option>
                  <option value="Atelier Mónaco (M)">Mónaco (M)</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cursos (Grupos)</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const subject = currentSubjects.find(s => s.id === newAssignment.subject_id);
                      const suffix = getSuffix(newAssignment.atelier);
                      const levelLetters = LEVEL_MAP[newAssignment.academic_level] || [];
                      
                      let available: string[] = [];
                      if (subject?.courses?.length) {
                        available = subject.courses.filter(c => levelLetters.some(l => c.startsWith(l)) && c.endsWith(`-${suffix}`));
                      } else {
                        levelLetters.forEach(l => {
                          for(let i=1; i<=12; i++) available.push(`${l}${i}-${suffix}`);
                        });
                      }

                      const allSelected = available.every(c => newAssignment.courses.includes(c));
                      setNewAssignment({
                        ...newAssignment, 
                        courses: allSelected ? [] : available
                      });
                    }}
                    className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {(() => {
                      const subject = currentSubjects.find(s => s.id === newAssignment.subject_id);
                      const suffix = getSuffix(newAssignment.atelier);
                      const levelLetters = LEVEL_MAP[newAssignment.academic_level] || [];
                      let available: string[] = [];
                      if (subject?.courses?.length) {
                        available = subject.courses.filter(c => levelLetters.some(l => c.startsWith(l)) && c.endsWith(`-${suffix}`));
                      } else {
                        levelLetters.forEach(l => {
                          for(let i=1; i<=12; i++) available.push(`${l}${i}-${suffix}`);
                        });
                      }
                      return available.every(c => newAssignment.courses.includes(c)) ? 'Deseleccionar Todos' : 'Seleccionar Todos';
                    })()}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                  {(() => {
                    const subject = currentSubjects.find(s => s.id === newAssignment.subject_id);
                    const suffix = getSuffix(newAssignment.atelier);
                    const levelLetters = LEVEL_MAP[newAssignment.academic_level] || [];
                    
                    let available: string[] = [];
                    if (subject?.courses?.length) {
                      // Filter subject courses by selected level and atelier
                      available = subject.courses.filter(c => levelLetters.some(l => c.startsWith(l)) && c.endsWith(`-${suffix}`));
                    } else {
                      // Generate standard courses for the level and atelier
                      levelLetters.forEach(l => {
                        for(let i=1; i<=12; i++) available.push(`${l}${i}-${suffix}`);
                      });
                    }

                    if (available.length === 0) {
                      return <p className="col-span-4 text-center py-4 text-[10px] font-bold text-slate-300 uppercase">Sin cursos disponibles</p>;
                    }

                    return available.map(code => {
                      const active = newAssignment.courses.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setNewAssignment(prev => ({
                              ...prev,
                              courses: active 
                                ? prev.courses.filter(c => c !== code)
                                : [...prev.courses, code]
                            }));
                          }}
                          className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            active 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <span className="text-[10px] font-black">{code.split('-')[0]}</span>
                          <span className="text-[8px] font-bold opacity-60">-{code.split('-')[1]}</span>
                          {active && (
                            <div className="absolute -top-1 -right-1 bg-white text-green-500 rounded-full p-0.5 shadow-sm">
                              <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving || hasNoYears || hasNoGrowers}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Crear Asignación
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Asignaciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Año</label>
              <select 
                value={filterYearId}
                onChange={(e) => {
                  setFilterYearId(e.target.value);
                  setFilterStationId('all'); // Reset station filter when year changes
                }}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-black"
              >
                <option value="all">Todos los Años</option>
                {schoolYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Nivel</label>
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-black"
              >
                <option value="all">Todos los Niveles</option>
                <option value="Petiné">Petiné</option>
                <option value="Elementary">Elementary</option>
                <option value="Middle">Middle</option>
                <option value="Highschool">Highschool</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Estación</label>
              <select 
                value={filterStationId}
                onChange={(e) => setFilterStationId(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-black"
              >
                <option value="all">Todas las Estaciones</option>
                {filterStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filtrar por Grower</label>
              <select 
                value={filterGrowerId}
                onChange={(e) => setFilterGrowerId(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-black"
              >
                <option value="all">Todos los Growers</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Grower</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estación / Materia</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel / Atelier</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Curso</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle size={40} className="text-slate-200" />
                          <p className="text-slate-400 font-medium">No hay asignaciones que coincidan con los filtros</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a) => (
                      <tr key={a.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                              {a.grower_name?.charAt(0)}
                            </div>
                            <p className="font-bold text-slate-900">{a.grower_name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-tight">{a.station_name}</p>
                            <p className="text-sm font-medium text-slate-500">{a.subject_name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900">{a.academic_level}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.atelier}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                            {a.course}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
