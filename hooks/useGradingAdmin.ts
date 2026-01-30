import { useState, useEffect, useMemo } from 'react';
import { SchoolYear, Lab, Modality, LearningMoment, Section, GradeSlot, Level } from '../types';
import { api } from '../services/api';

const generateUUID = () => crypto.randomUUID();

export const useGradingAdmin = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null);

  const [selectedStationIdx, setSelectedStationIdx] = useState(0);
  const [selectedMomentIdx, setSelectedMomentIdx] = useState(0);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSchoolYear();
        setSchoolYear(data);
      } catch (error) {
        console.error("Error loading school year:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const validations = useMemo(() => {
    if (!schoolYear) return { stations: false, stationTotal: 0, momentTotal: 0, sectionTotal: 0, gradeTotal: 0 };
    const stationSum = schoolYear.stations.reduce((acc, s) => acc + (s.weight || 0), 0);
    const currentStation = schoolYear.stations[selectedStationIdx];
    const momentSum = currentStation?.moments.reduce((acc, m) => acc + (m.weight || 0), 0) || 0;
    const currentMoment = currentStation?.moments[selectedMomentIdx];
    const sectionSum = currentMoment?.sections.reduce((acc, sec) => acc + (sec.weight || 0), 0) || 0;
    const currentSection = currentMoment?.sections[selectedSectionIdx];
    
    const gradeSum = currentSection?.gradeSlots
      .reduce((acc, slot) => acc + (slot.weight || 0), 0) || 0;

    return {
      stations: Math.abs(stationSum - 100) < 0.1,
      stationTotal: stationSum,
      momentTotal: momentSum,
      sectionTotal: sectionSum,
      gradeTotal: gradeSum
    };
  }, [schoolYear, selectedStationIdx, selectedMomentIdx, selectedSectionIdx]);

  const moveSubject = (subjectIdx: number, fromIdx: number, toIdx: number) => {
    if (!schoolYear || fromIdx === toIdx) return;
    const newStations = [...schoolYear.stations];
    const subject = newStations[fromIdx].subjects[subjectIdx];
    if (!subject) return;
    newStations[fromIdx].subjects.splice(subjectIdx, 1);
    newStations[toIdx].subjects.push(subject);
    setSchoolYear({ ...schoolYear, stations: newStations });
  };

  const moveGradeSlot = (slotIdx: number, fromSectionIdx: number, toSectionIdx: number) => {
    if (!schoolYear) return;
    const newStations = [...schoolYear.stations];
    const moment = newStations[selectedStationIdx].moments[selectedMomentIdx];
    if (!moment || !moment.sections[fromSectionIdx]) return;
    const slot = moment.sections[fromSectionIdx].gradeSlots[slotIdx];
    if (!slot) return;
    moment.sections[fromSectionIdx].gradeSlots.splice(slotIdx, 1);
    moment.sections[toSectionIdx].gradeSlots.push(slot);
    setSchoolYear({ ...schoolYear, stations: newStations });
  };

  const addSection = () => {
    if (!schoolYear) return;
    const newStations = [...schoolYear.stations];
    const station = newStations[selectedStationIdx];
    if (!station || !station.moments[selectedMomentIdx]) return;
    station.moments[selectedMomentIdx].sections.push({
      id: generateUUID(),
      name: 'Nueva Sección',
      weight: 0,
      gradeSlots: []
    });
    setSchoolYear({ ...schoolYear, stations: newStations });
  };

  const addGradeSlot = () => {
    if (!schoolYear) return;
    const newStations = [...schoolYear.stations];
    const station = newStations[selectedStationIdx];
    const moment = station?.moments[selectedMomentIdx];
    if (!moment || !moment.sections[selectedSectionIdx]) return;
    moment.sections[selectedSectionIdx].gradeSlots.push({
      id: generateUUID(),
      name: 'Nueva Nota',
      weight: 0,
      scale: '1 - 5'
    });
    setSchoolYear({ ...schoolYear, stations: newStations });
  };

  const handleSave = async () => {
    if (!schoolYear) return;
    setIsSaving(true);
    try {
      await api.updateSchoolYear(schoolYear);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving school year structure:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentStep, setCurrentStep,
    isSaving, isLoading, saveSuccess,
    schoolYear, setSchoolYear,
    selectedStationIdx, setSelectedStationIdx,
    selectedMomentIdx, setSelectedMomentIdx,
    selectedSectionIdx, setSelectedSectionIdx,
    selectedSubjectIdx, setSelectedSubjectIdx,
    validations, handleSave,
    moveSubject, moveGradeSlot, addSection, addGradeSlot
  };
};