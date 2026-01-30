import { Station } from '../../../../../types';

export function calculateStudentGrades({
  studentId,
  station,
  getGradeValue
}: {
  studentId: string;
  station: Station;
  subjectId: string; // Mantenemos el parámetro por compatibilidad de firma pero no lo usamos para filtrar slots
  getGradeValue: (studentId: string, slotId: string, subjectId: string) => string;
}) {
  let totalStationWeighted = 0;
  let totalStationWeight = 0;
  const moments: Record<string, number> = {};

  station.moments?.forEach(moment => {
    let momentScore = 0;
    let momentWeight = 0;

    moment.sections?.forEach(section => {
      // Ahora no filtramos por subjectId: los slots son comunes a todas las materias
      const slots = section.gradeSlots ?? [];

      let sectionScore = 0;
      let sectionWeight = 0;

      slots.forEach(slot => {
        // Obtenemos el valor de la nota. Nota: getGradeValue todavía usa subjectId en su almacenamiento
        // pero aquí mostramos/calculamos el mismo slot para cualquier materia seleccionada.
        const valStr = getGradeValue(studentId, slot.id, "global"); // Usamos un ID global o el actual
        const val = (valStr === '' || valStr === null) ? 0 : Number(valStr);
        sectionScore += val * (slot.weight || 0);
        sectionWeight += (slot.weight || 0);
      });

      const sectionAvg = sectionWeight > 0 ? sectionScore / sectionWeight : 0;
      momentScore += sectionAvg * (section.weight || 0);
      momentWeight += (section.weight || 0);
    });

    const momentAvg = momentWeight > 0 ? momentScore / momentWeight : 0;
    moments[moment.id] = momentAvg;

    totalStationWeighted += momentAvg * (moment.weight || 0);
    totalStationWeight += (moment.weight || 0);
  });

  return {
    moments,
    final: totalStationWeight > 0 ? totalStationWeighted / totalStationWeight : 0
  };
}