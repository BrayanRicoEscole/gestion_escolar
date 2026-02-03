import React, { useEffect, useState } from 'react';

import { useStudents } from './hooks/useStudents';
import { useStudentFilters } from './hooks/useStudentFilters';
import { useStudentSync } from './hooks/useStudentSync';

import { Student } from '../../types';



import { SyncPanel } from './components/SyncPanel';
import { StudentsFilters } from './components/StudentsFilters';
import { StudentsTable } from './components/StudentsTable';
import { StudentModal } from './components/StudentModal';

export const ActiveStudentsModule: React.FC = () => {
  /* ===================== Data ===================== */
  const { students, loading, refetch } = useStudents();

  /* ===================== Filters ===================== */
  const { filtered, filters, setters } = useStudentFilters(students);

  /* ===================== Sync ===================== */
  const {
    syncing,
    status,
    syncFromSpreadsheet,
    syncFromFile,
  } = useStudentSync({
    onSuccess: refetch,
  });

  /* ===================== UI State ===================== */
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /* ===================== Lifecycle ===================== */
  useEffect(() => {
    refetch();
  }, []);

  /* ===================== Render ===================== */
  return (
    <>

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
      />

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};
