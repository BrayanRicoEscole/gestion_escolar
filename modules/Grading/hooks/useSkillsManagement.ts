import { useMemo } from 'react';
import { Level, SchoolYear, Skill } from '../../../types';
import { isValidUUID } from '../../../services/api/utils';

export const useSkillsManagement = (
  year: SchoolYear,
  setYear: (prev: any) => void,
  stationIdx: number,
  subjectIdx: number
) => {
  const currentStation = year.stations[stationIdx];
  const currentSubject = currentStation?.subjects[subjectIdx];

  const addSkill = (level: Level) => {
    if (!currentSubject) return;
    const newSkill: Skill = {
      id: `temp-${Date.now()}`,
      level,
      description: ''
    };
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      sub.skills = [...(sub.skills || []), newSkill];
      return nextYear;
    });
  };

  const removeSkill = (id: string) => {
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      sub.skills = (sub.skills || []).filter(s => s.id !== id);
      return nextYear;
    });
  };

  const updateSkill = (id: string, text: string) => {
    setYear((prev: SchoolYear) => {
      const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
      const skill = sub.skills?.find(s => s.id === id);
      if (skill) skill.description = text;
      return nextYear;
    });
  };

  const hasUnsyncedChanges = useMemo(() => {
    return currentSubject?.skills?.some(s => !isValidUUID(s.id)) || false;
  }, [currentSubject]);

  const exportSkillsToCsv = () => {
    if (!currentSubject?.skills?.length) return;
    if (hasUnsyncedChanges) {
      alert("⚠️ Hay habilidades nuevas sin sincronizar. Por favor, guarde los cambios (Sincronizar Cambios) antes de exportar para obtener los IDs definitivos de la base de datos.");
      return;
    }

    const headers = ['id', 'nivel', 'descripcion'];
    const rows = currentSubject.skills.map(s => [
      s.id,
      s.level,
      `"${s.description.replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `habilidades_${currentSubject.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importSkillsFromCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const newSkills: Skill[] = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Better CSV parser that handles empty columns and quotes
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            if (inQuotes && line[j + 1] === '"') {
              current += '"';
              j++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        if (parts.length >= 2) {
          let id = parts[0].trim();
          const level = parts[1].trim() as Level;
          const description = parts[2] ? parts[2].trim() : '';

          // If ID is not a valid UUID, treat as new skill with temp ID
          if (!isValidUUID(id)) {
            id = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }

          if (Object.values(Level).includes(level)) {
            newSkills.push({ id, level, description });
          }
        }
      }

      if (newSkills.length > 0) {
        setYear((prev: SchoolYear) => {
          const nextYear = JSON.parse(JSON.stringify(prev)) as SchoolYear;
          const sub = nextYear.stations[stationIdx].subjects[subjectIdx];
          
          // Merge or replace? Let's merge by ID, update existing, add new
          const existingSkills = sub.skills || [];
          const mergedSkills = [...existingSkills];

          newSkills.forEach(ns => {
            const idx = mergedSkills.findIndex(ms => ms.id === ns.id);
            if (idx !== -1) {
              mergedSkills[idx] = ns;
            } else {
              mergedSkills.push(ns);
            }
          });

          sub.skills = mergedSkills;
          return nextYear;
        });
      }
    };
    reader.readAsText(file);
  };

  return {
    addSkill,
    removeSkill,
    updateSkill,
    exportSkillsToCsv,
    importSkillsFromCsv,
    currentSubject,
    currentStation,
    hasUnsyncedChanges
  };
};
