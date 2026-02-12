import React from 'react'
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import {Station, GradeEntry, LearningMoment, SkillSelection} from 'types'
import { useReport } from '../../../hooks/useReports';

const labsStyles = {
  "CLEPE": {
    "name": "📖 LABORATORIO CLEPE",
    "desc": "CUERPO, LETRAS Y PENSAMIENTO",
    "color": "#f29c2b"
  },
  "Onda": {
    "name": "🏃‍♀️LABORATORIO ONDA",
    "desc": "CREATIVIDAD, JUEGO Y MOVIMIENTO",
    "color": "#199e77"
  },
  "MEC": {
    "name": "🔬LABORATORIO MEC",
    "desc": "MODELACIÓN, EXPERIMENTACIÓN Y COMPROBACIÓN",
    "color": "#0f4899"
  }
}
interface Props {
  studentId: string
  currentStation: Station | null;
  grades: GradeEntry[];
  skillSelections: SkillSelection[];
  
}
const MomentosPage : React.FC<Props> = ({ currentStation, grades, studentId,skillSelections}) => {
  const { reportData, labs, generalAverage } = useReport(
    currentStation,
    studentId,
    grades
  );
  return(
<div className="report-page relative border border-border shadow-lg p-8 pb-14 py-0 pt-0 pl-0 pr-0">

    <ReportHeader />

    <div className="mt-12 relative z-10 px-[50px]">
      <p className="text-center mb-4">
        <span className="text-sm text-[#0f4899]">Tabla 2. </span>
        <span className=" font-bold text-[#0f4899] text-lg">
          Porcentajes de los Momentos de Aprendizaje
        </span>
      </p>

      <table className="w-full border border-[#ff9900] rounded-lg overflow-hidden mb-10 ">
        <thead>
          <tr className="bg-[#ff9900] border border-[#ff9900]">
            <th colSpan={5} className="text-center px-5 py-3 text-white  font-bold text-base border border-[#ff9900]">
              Momentos de Aprendizaje
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-[#ff9900]  bg-background">
            <td className="px-5 py-2 text-[#0f4899]  font-bold text-sm text-center w-40 border border-[#ff9900]">Momento</td>
            {currentStation.moments.map((learningMoment: LearningMoment) => (
  <td
    key={learningMoment.id} // use a unique id if available
    className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]"
  >
    {learningMoment.name}
  </td>
))}
           
          </tr>
          <tr className="border border-[#ff9900] bg-background">
            <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center border border-[#ff9900]">Duración</td>
            <td className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">1 semana</td>
            <td className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900] ">5 semanas</td>
            <td className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900] ">2 semanas</td>
            <td className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900] ">2 semanas</td>
          </tr>
          <tr className="bg-background border border-[#ff9900]">
            <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center border border-[#ff9900]">Porcentaje</td>
            {currentStation.moments.map((learningMoment: LearningMoment) => (
   <td className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">{learningMoment.weight}</td>
))}
            
          </tr>
        </tbody>
      </table>

      <p className="text-center mb-4">
        <span className="text-sm text-[#0f4899]">Tabla 3. </span>
        <span className=" font-bold text-lg text-[#0f4899]">
          Reporte Evaluación Formativa y Sumativa
        </span>
      </p>

      <table className="w-full border border-[ff9900] overflow-hidden">
        <thead>
          <tr className="bg-[#0f4899]">
            <th rowSpan={2} className="px-4 py-2  font-bold text-xs w-40 border border-white">
              ÁREA
            </th>
            <th colSpan={4} className="text-center px-4 py-2  font-bold text-xs border border-white">
              MOMENTOS DE APRENDIZAJE
            </th>
            <th rowSpan={2} className="px-4 py-2  font-bold text-xs text-center">
              VALORACIÓN
            </th>
          </tr>
          <tr className="bg-[#0f4899]">
          {currentStation.moments.map((learningMoment: LearningMoment) => (
  <th className="px-3 py-1  font-bold text-[10px] text-center border-r border-white">{learningMoment.name}<br />({learningMoment.weight})</th>
))}
          
          </tr>
        </thead>
        <tbody>
        {Object.entries(labs).map(([labName, items]) => (
          <React.Fragment key={labName}>
          <tr className="border-b border-[#ff9900] bg-muted/20">
            <td colSpan={6} className="px-4 py-2">
              <div className={`font-bold text-[${labsStyles[labName].color }] text-sm`}>{labsStyles[labName].name } </div>
              <div className={`font-bold text-[${labsStyles[labName].color }] text-xs`}>{labsStyles[labName].desc } </div>
            </td>
          </tr>
          {items.map((subject)=>(
            <React.Fragment key={subject.subject.name}> <tr className="border-b border-[#ff9900]">
            <td className={`px-4 py-2  font-bold text-[${labsStyles[labName].color }]  text-xs border-r border-[#ff9900]`}>{subject.subject.name}</td>
            {subject.momentResults.map((m: any) => (
                              
                              <td key={m.id} className="px-4 py-6 text-center border-l border-slate-100 border border-[#ff9900]">
                                <span className={`text-xs text-[#0f4899] `}>
                                  {m.hasData ? (m.average >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}
                                </span>
                              </td>
                            ))}
   
             <td className="px-4 py-2 text-[#0f4899] text-xs border border-[#ff9900]"> {subject.finalStationAvg > 0 ? (subject.finalStationAvg >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}</td>
            </tr>
            <tr className="border-b border-[#ff9900]">
            <td className="px-4 py-2  font-bold text-[#ff9900] text-xs border-r border-[#ff9900]">Habilidades {subject.subject.name}</td>
            <td colSpan={5} className="px-4 py-2 text-sm text-[#ff9900] border-r border-[#ff9900]"> {
    skillSelections.find(
      (skillSelection: SkillSelection) =>
        skillSelection.subjectId === subject.subject.id
    )?.subjectId ?? "—"
  }</td>
            
          </tr>
          </React.Fragment>
        ))}
         
          </React.Fragment>
          )
        )}
        
        </tbody>
      </table>
    </div>

    <ReportFooter />
  </div>
  )
}
export default MomentosPage;