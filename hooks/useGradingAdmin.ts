
import { useState, useEffect } from 'react';
import { SchoolYear, CommentTemplate, Subject, Section, GradeSlot } from '../types';
import { getSchoolYear, getCommentTemplates, updateSchoolYear, saveCommentTemplates } from '../services/api';

export const useGradingAdmin = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);
  const [commentTemplates, setCommentTemplates] = useState<CommentTemplate[]>([]);

  const [selectedStationIdx, setSelectedStationIdx] = useState(0);
  const [selectedMomentIdx, setSelectedMomentIdx] = useState(0);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSchoolYear();
        setSchoolYear(data);
        if (data) {
          const templates = await getCommentTemplates(data.id);
          setCommentTemplates(templates);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reseteo de índices para evitar errores de desbordamiento al cambiar de contexto
  useEffect(() => {
    setSelectedSubjectIdx(0);
    setSelectedMomentIdx(0);
  }, [selectedStationIdx]);

  useEffect(() => {
    setSelectedSectionIdx(0);
  }, [selectedMomentIdx]);

  const handleSave = async () => {
    if (!schoolYear) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateSchoolYear(schoolYear),
        saveCommentTemplates(commentTemplates)
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving structure:", error);
      alert("Error al guardar la estructura. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  };

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

  const toggleCourse = (subIdx: number, courseCode: string | string[]) => {
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
        if (subject.courses.includes(code)) {
          subject.courses = subject.courses.filter(c => c !== code);
        } else {
          subject.courses.push(code);
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
      
      const newSection: Section = {
        id: crypto.randomUUID(),
        name: 'Nueva Sección',
        weight: 0,
        gradeSlots: []
      };
      
      moment.sections.push(newSection);
      return next;
    });
  };

  const addGradeSlot = () => {
    if (!schoolYear) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      if (!station) return next;
      const moment = station.moments[selectedMomentIdx];
      if (!moment) return next;
      const section = moment.sections[selectedSectionIdx];
      if (!section) return next;
      
      const newSlot: GradeSlot = {
        id: crypto.randomUUID(),
        name: 'Nueva Nota',
        weight: 0,
        scale: '1 - 5'
      };
      
      section.gradeSlots.push(newSlot);
      return next;
    });
  };

  const moveGradeSlot = (slotIdx: number, fromSecIdx: number, toSecIdx: number) => {
    if (!schoolYear || fromSecIdx === toSecIdx) return;
    setSchoolYear(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as SchoolYear;
      const station = next.stations[selectedStationIdx];
      if (!station) return next;
      const moment = station.moments[selectedMomentIdx];
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
    const newTemplate: CommentTemplate = {
      id: crypto.randomUUID(),
      schoolYearId: schoolYear.id,
      academicLevel: level,
      fieldKey,
      content
    };
    setCommentTemplates(prev => [...prev, newTemplate]);
  };

  const addBulkTemplates = (levels: string[], fieldKey: string, content: string) => {
    if (!schoolYear || !content.trim()) return;
    const newTemplates: CommentTemplate[] = levels.map(lvl => ({
      id: crypto.randomUUID(),
      schoolYearId: schoolYear!.id,
      academicLevel: lvl,
      fieldKey,
      content
    }));
    setCommentTemplates(prev => [...prev, ...newTemplates]);
  };

  const cloneTemplates = (sourceLevel: string, targetLevels: string[]) => {
    if (!schoolYear) return;
    
    const sourceTemplates = commentTemplates.filter(t => t.academicLevel === sourceLevel);
    const newTemplates: CommentTemplate[] = [];

    targetLevels.forEach(targetLvl => {
      sourceTemplates.forEach(source => {
        const alreadyExists = commentTemplates.find(t => 
          t.academicLevel === targetLvl && 
          t.fieldKey === source.fieldKey && 
          t.content === source.content
        );

        if (!alreadyExists) {
          newTemplates.push({
            id: crypto.randomUUID(),
            schoolYearId: schoolYear!.id,
            academicLevel: targetLvl,
            fieldKey: source.fieldKey,
            content: source.content
          });
        }
      });
    });

    setCommentTemplates(prev => [...prev, ...newTemplates]);
  };

  const removeCommentTemplate = (id: string) => {
    setCommentTemplates(prev => prev.filter(t => t.id !== id));
  };

  const updateTemplateContent = (id: string, content: string) => {
    setCommentTemplates(prev => prev.map(t => t.id === id ? { ...t, content } : t));
  };

  return {
    currentStep, setCurrentStep,
    isSaving, isLoading, saveSuccess,
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
    validations: { stationTotal: 100, momentTotal: 100, sectionTotal: 100, gradeTotal: 100 }
  };
};
