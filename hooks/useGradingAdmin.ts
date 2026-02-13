
import { useState, useEffect } from 'react';
import { SchoolYear, CommentTemplate, Subject, Section, GradeSlot, LearningMoment, Station } from '../types';
import { getSchoolYear, getCommentTemplates, updateSchoolYear, saveCommentTemplates, getSchoolYearsList } from '../services/api';
import { parseYearCsv } from '../modules/Grading/utils/YearCsvService';

export const useGradingAdmin = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [allYears, setAllYears] = useState<{id: string, name: string}[]>([]);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [commentTemplates, setCommentTemplates] = useState<CommentTemplate[]>([]);

  const [selectedStationIdx, setSelectedStationIdx] = useState(0);
  const [selectedMomentIdx, setSelectedMomentIdx] = useState(0);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);

  // Carga inicial de la lista de años
  useEffect(() => {
    fetchYearsList();
  }, []);

  const fetchYearsList = async () => {
    setIsLoading(true);
    try {
      const years = await getSchoolYearsList();
      setAllYears(years);
    } catch (error) {
      console.error("Error loading years list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadYear = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getSchoolYear(id);
      setSchoolYear(data);
      if (data) {
        const templates = await getCommentTemplates(data.id);
        setCommentTemplates(templates);
      }
      setCurrentStep(1); // Reset al primer paso al cambiar de año
    } catch (error) {
      console.error("Error loading year details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewYear = (name: string) => {
    const newId = crypto.randomUUID();
    const baseYear: SchoolYear = {
      id: newId,
      name: name,
      stations: [
        {
          id: crypto.randomUUID(),
          name: 'Nueva Estación',
          weight: 100,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          moments: [],
          subjects: []
        }
      ]
    };
    setSchoolYear(baseYear);
    setCommentTemplates([]);
    setCurrentStep(1);
  };

  const importYearFromCsv = async (file: File) => {
    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedYears = parseYearCsv(text);
        
        if (importedYears.length === 0) {
          alert("No se encontró una estructura válida en el CSV.");
          return;
        }

        // Guardar cada año importado
        for (const year of importedYears) {
          await updateSchoolYear(year);
        }
        
        await fetchYearsList();
        alert(`Se han importado ${importedYears.length} años escolares exitosamente.`);
      } catch (err) {
        console.error("Error importing CSV:", err);
        alert("Error al procesar el archivo CSV. Verifique el formato.");
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
  };

  const addStation = () => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      next.stations.push({
        id: crypto.randomUUID(),
        name: 'Nueva Estación',
        weight: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        moments: [],
        subjects: []
      });
      return next;
    });
  };

  const removeStation = (idx: number) => {
    if (!schoolYear || schoolYear.stations.length <= 1) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      next.stations.splice(idx, 1);
      return next;
    });
    if (selectedStationIdx >= schoolYear.stations.length - 1) {
      setSelectedStationIdx(Math.max(0, schoolYear.stations.length - 2));
    }
  };

  const addMoment = () => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      if (!station) return next;
      station.moments.push({
        id: crypto.randomUUID(),
        name: 'Nuevo Momento',
        weight: 0,
        sections: []
      });
      return next;
    });
  };

  const removeMoment = (miIdx: number) => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      next.stations[selectedStationIdx].moments.splice(miIdx, 1);
      return next;
    });
  };

  const handleSave = async () => {
    if (!schoolYear) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateSchoolYear(schoolYear),
        saveCommentTemplates(commentTemplates)
      ]);
      setSaveSuccess(true);
      await fetchYearsList(); // Actualizar lista tras guardar
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving structure:", error);
      alert("Error al guardar la estructura.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset indices
  useEffect(() => {
    setSelectedSubjectIdx(0);
    setSelectedMomentIdx(0);
  }, [selectedStationIdx, schoolYear]);

  useEffect(() => {
    setSelectedSectionIdx(0);
  }, [selectedMomentIdx]);

  const moveSubject = (subIdx: number, fromStationIdx: number, toStationIdx: number) => {
    if (!schoolYear || fromStationIdx === toStationIdx) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const fromStation = next.stations[fromStationIdx];
      const toStation = next.stations[toStationIdx];
      if (!fromStation || !toStation) return next;
      const [movedSubject] = fromStation.subjects.splice(subIdx, 1);
      if (movedSubject) toStation.subjects.push(movedSubject);
      return next;
    });
  };

  const toggleCourse = (subIdx: number, courseCode: string | string[], forceValue?: boolean) => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      if (!station || !station.subjects) return next;
      const subject = station.subjects[subIdx];
      if (!subject) return next;
      if (!subject.courses) subject.courses = [];
      const codes = Array.isArray(courseCode) ? courseCode : [courseCode];
      codes.forEach(code => {
        const alreadyExists = subject.courses.includes(code);
        if (forceValue !== undefined) {
          if (forceValue && !alreadyExists) subject.courses.push(code);
          else if (!forceValue && alreadyExists) subject.courses = subject.courses.filter(c => c !== code);
        } else {
          if (alreadyExists) subject.courses = subject.courses.filter(c => c !== code);
          else subject.courses.push(code);
        }
      });
      return next;
    });
  };

  const addSection = () => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      if (!station) return next;
      const moment = station.moments[selectedMomentIdx];
      if (!moment) return next;
      moment.sections.push({ id: crypto.randomUUID(), name: 'Nueva Sección', weight: 0, gradeSlots: [] });
      return next;
    });
  };

  const addGradeSlot = () => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      const moment = station?.moments[selectedMomentIdx];
      const section = moment?.sections[selectedSectionIdx];
      if (!section) return next;
      section.gradeSlots.push({ id: crypto.randomUUID(), name: 'Nueva Nota', weight: 0, scale: '1 - 5' });
      return next;
    });
  };

  const moveGradeSlot = (slotIdx: number, fromSecIdx: number, toSecIdx: number) => {
    if (!schoolYear || fromSecIdx === toSecIdx) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const moment = next.stations[selectedStationIdx]?.moments[selectedMomentIdx];
      if (!moment) return next;
      const fromSec = moment.sections[fromSecIdx];
      const toSec = moment.sections[toSecIdx];
      if (!fromSec || !toSec) return next;
      const [movedSlot] = fromSec.gradeSlots.splice(slotIdx, 1);
      if (movedSlot) toSec.gradeSlots.push(movedSlot);
      return next;
    });
  };

  const addCommentTemplate = (level: string, fieldKey: string, content: string = '') => {
    if (!schoolYear) return;
    const newTemplate: CommentTemplate = { id: crypto.randomUUID(), schoolYearId: schoolYear.id, academicLevel: level, fieldKey, content };
    setCommentTemplates(prev => [...prev, newTemplate]);
  };

  const addBulkTemplates = (levels: string[], fieldKey: string, content: string) => {
    if (!schoolYear || !content.trim()) return;
    const newTemplates: CommentTemplate[] = levels.map(lvl => ({ id: crypto.randomUUID(), schoolYearId: schoolYear!.id, academicLevel: lvl, fieldKey, content }));
    setCommentTemplates(prev => [...prev, ...newTemplates]);
  };

  const cloneTemplates = (sourceLevel: string, targetLevels: string[]) => {
    if (!schoolYear) return;
    const sourceTemplates = commentTemplates.filter(t => t.academicLevel === sourceLevel);
    const newTemplates: CommentTemplate[] = [];
    targetLevels.forEach(targetLvl => {
      sourceTemplates.forEach(source => {
        const alreadyExists = commentTemplates.find(t => t.academicLevel === targetLvl && t.fieldKey === source.fieldKey && t.content === source.content);
        if (!alreadyExists) {
          newTemplates.push({ id: crypto.randomUUID(), schoolYearId: schoolYear!.id, academicLevel: targetLvl, fieldKey: source.fieldKey, content: source.content });
        }
      });
    });
    setCommentTemplates(prev => [...prev, ...newTemplates]);
  };

  const removeCommentTemplate = (id: string) => setCommentTemplates(prev => prev.filter(t => t.id !== id));
  const updateTemplateContent = (id: string, content: string) => setCommentTemplates(prev => prev.map(t => t.id === id ? { ...t, content } : t));

  return {
    currentStep, setCurrentStep,
    isSaving, isLoading, saveSuccess,
    allYears, loadYear, createNewYear,
    importYearFromCsv,
    schoolYear, setSchoolYear,
    commentTemplates, addCommentTemplate, addBulkTemplates, removeCommentTemplate, updateTemplateContent, cloneTemplates,
    selectedStationIdx, setSelectedStationIdx,
    selectedMomentIdx, setSelectedMomentIdx,
    selectedSectionIdx, setSelectedSectionIdx,
    selectedSubjectIdx, setSelectedSubjectIdx,
    handleSave,
    moveSubject,
    toggleCourse,
    addSection,
    addGradeSlot,
    moveGradeSlot,
    addStation,
    removeStation,
    addMoment,
    removeMoment,
    validations: { stationTotal: schoolYear?.stations.reduce((acc, s) => acc + (s.weight || 0), 0) || 0, momentTotal: schoolYear?.stations[selectedStationIdx]?.moments.reduce((acc, m) => acc + (m.weight || 0), 0) || 0, sectionTotal: schoolYear?.stations[selectedStationIdx]?.moments[selectedMomentIdx]?.sections.reduce((acc, s) => acc + (s.weight || 0), 0) || 0, gradeTotal: schoolYear?.stations[selectedStationIdx]?.moments[selectedMomentIdx]?.sections[selectedSectionIdx]?.gradeSlots.reduce((acc, g) => acc + (g.weight || 0), 0) || 0 }
  };
};
