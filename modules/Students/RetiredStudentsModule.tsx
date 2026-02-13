
import React, { useEffect, useState } from 'react';
import { useStudentFilters } from './hooks/useStudentFilters';
import { Student } from '../../types';
import { getRetiredStudents } from '../../services/api';
import { StudentsFilters } from './components/StudentsFilters';
import { StudentsTable } from './components/StudentsTable';
import { StudentModal } from './components/StudentModal';
import { UserX, Info } from 'lucide-react';

export const RetiredStudentsModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Added selection state required by StudentsTable
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchRetired = async () => {
    setLoading(true);
    try {
      const data = await getRetiredStudents();
      setStudents(data);
    } catch (e) {
      console.error("Error fetching retired students:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetired();
  }, []);

  const { filtered, filters, setters } = useStudentFilters(students);

  // Added selection handlers required by StudentsTable
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.id || ''));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-black">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
             <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                <UserX size={32} />
             </div>
             Archivo Estudiantes Retirados
          </h1>
          <p className="text-slate-500 font-medium mt-2">Consulta expedientes históricos y trazabilidad de ex-seeds</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 max-w-md">
           <Info size={20} className="text-amber-500 shrink-0" />
           <p className="text-[11px] font-bold text-amber-700 leading-tight">
             Esta vista muestra estudiantes cuyo estado actual no es "Activo". Puedes consultar sus reportes históricos desde su ficha personal.
           </p>
        </div>
      </header>

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

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
