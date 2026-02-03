
import { useState, useEffect } from 'react';
import { SchoolYear, CommentTemplate } from '../types';
import { api } from '../services/api';

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
        const data = await api.getSchoolYear();
        setSchoolYear(data);
        if (data) {
          const templates = await api.getCommentTemplates(data.id);
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

  const handleSave = async () => {
    if (!schoolYear) return;
    setIsSaving(true);
    try {
      await Promise.all([
        api.updateSchoolYear(schoolYear),
        api.saveCommentTemplates(commentTemplates)
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving structure:", error);
    } finally {
      setIsSaving(false);
    }
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
    validations: { stationTotal: 100, momentTotal: 100, sectionTotal: 100, gradeTotal: 100 },
    moveSubject: () => {}, moveGradeSlot: () => {}, addSection: () => {}, addGradeSlot: () => {}, toggleCourse: () => {}
  };
};
