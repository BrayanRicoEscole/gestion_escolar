
import { useCallback, useRef, useState } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import saveAs from 'file-saver';
import { ReportTemplate, Student, Station, SkillSelection, StudentComment } from '../../../../types';

interface Params {
  templates: ReportTemplate[];
  selectedTemplateId: string;
  student: Student;
  station: Station;
  reportData: any[]; 
  generalAverage: number;
  comment?: StudentComment;
  skillSelections: SkillSelection[];
}

export function useDocxGenerator({
  templates,
  selectedTemplateId,
  student,
  station,
  reportData,
  generalAverage,
  comment,
  skillSelections
}: Params) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cache = useRef<Map<string, ArrayBuffer>>(new Map());

  // Lógica cualitativa: 3.7 es el umbral de éxito institucional
  const getQualitativeStatus = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) return '—';
    return val >= 3.7 ? 'Consolidado' : 'No Consolidado';
  };

  const generateDocx = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    setIsGenerating(true);
    try {
      let content = cache.current.get(template.id);
      if (!content) {
        const response = await fetch(template.file_url);
        content = await response.arrayBuffer();
        cache.current.set(template.id, content);
      }

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '<<', end: '>>' }
      });

      // 1. Agrupar por Laboratorios y procesar habilidades por asignatura
      const labsMap: Record<string, any[]> = {};
      
      reportData.forEach(r => {
        const labName = r.subject.lab || 'General';
        if (!labsMap[labName]) labsMap[labName] = [];
        
        // Obtener descripciones de habilidades seleccionadas para esta materia
        const selectedIds = skillSelections
          .filter(s => s.studentId === student.id && s.subjectId === r.subject.id && s.stationId === station.id)
          .map(s => s.skillId);
        
        const subjectSkillsDescriptions = (r.subject.skills || [])
          .filter((sk: any) => selectedIds.includes(sk.id))
          .map((sk: any) => sk.description)
          .join('\n');

        labsMap[labName].push({
          name: r.subject.name,
          skills_summary: subjectSkillsDescriptions || 'Proceso en desarrollo.',
          // Notas de los momentos transformadas a Cualitativo
          m1: r.momentResults[0]?.hasData ? getQualitativeStatus(r.momentResults[0].average) : '—',
          m2: r.momentResults[1]?.hasData ? getQualitativeStatus(r.momentResults[1].average) : '—',
          m3: r.momentResults[2]?.hasData ? getQualitativeStatus(r.momentResults[2].average) : '—',
          m4: r.momentResults[3]?.hasData ? getQualitativeStatus(r.momentResults[3].average) : '—',
          final: getQualitativeStatus(r.finalStationAvg)
        });
      });

      const labsList = Object.entries(labsMap).map(([name, subjects]) => ({
        lab_name: name,
        subjects: subjects
      }));

      // 2. Cargar datos al motor de plantillas
      doc.setData({
        // Datos Personales
        full_name: student.full_name,
        document: student.document,
        academic_level: student.academic_level,
        grade: student.grade,
        atelier: student.atelier,
        rama: student.rama,
        calendar: student.calendario,
        modality: student.modality === 'RS' ? 'Sede' : 'Casa',
        codigo_estudiantil: student.codigo_estudiantil,
        paz_y_salvo: student.paz_y_salvo,
        
        // Datos de la Estación
        station_name: station.name,
        date: new Date().toLocaleDateString(),
        
        // Resumen General Cualitativo
        average_station: getQualitativeStatus(generalAverage),
        convivencia_grade: getQualitativeStatus(comment?.convivenciaGrade),
        
        // Secciones Cualitativas (Campos solicitados)
        academic_cons: comment?.academicCons || 'Sin registros consolidados.',
        academic_non: comment?.academicNon || 'Sin registros de retos pendientes.',
        emotional_skills: comment?.emotionalSkills || 'Sin registros socioemocionales.',
        talents: comment?.talents || 'Sin talentos registrados.',
        social_interaction: comment?.socialInteraction || 'Sin registros convivenciales.',
        challenges: comment?.challenges || 'Sin desafíos registrados.',
        piar_desc: comment?.piarDesc || 'No aplica / Sin registros.',
        // Fix: property name was learningCropDesc, should be learning_crop_desc
        learning_crop_desc: comment?.learning_crop_desc || 'Sin vivencia registrada.',
        comment: comment?.comentary || '',
        
        // Estructura de Tabla
        labs: labsList
      });

      doc.render();
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      saveAs(out, `Reporte_${student.full_name}_${station.name}.docx`);
    } catch (error) {
      console.error("Error en generación de Word:", error);
      alert("Hubo un error al procesar la plantilla. Verifica que todas las etiquetas << >> estén correctamente escritas y cerradas.");
    } finally {
      setIsGenerating(false);
    }
  }, [templates, selectedTemplateId, student, station, reportData, generalAverage, comment, skillSelections]);

  return { generateDocx, isGenerating };
}
