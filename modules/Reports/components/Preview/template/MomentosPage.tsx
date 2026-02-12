
import React from 'react'
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import {Station, GradeEntry, LearningMoment, SkillSelection} from 'types'
import { useReport, ReportSubject } from '../../../hooks/useReports';

const labsStyles: Record<string, any> = {
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
  },
  "General": {
    "name": "📚 LABORATORIO GENERAL",
    "desc": "PROCESOS INTEGRALES",
    "color": "#64748b"
  }
}

interface Props {
  studentId: string;
  currentStation: Station | null;
  grades: GradeEntry[];
  skillSelections: SkillSelection[];
}

const MomentosPage : React.FC<Props> = ({ currentStation, grades, studentId, skillSelections}) => {
  const { labs } = useReport(
    currentStation,
    studentId,
    grades,
    skillSelections
  );

  if (!currentStation) return null;

  return (
    <div className="report-page relative border border-border shadow-lg p-0 bg-white">
      <ReportHeader />

      <div className="mt-12 relative z-10 px-[50px]">
        {/* TABLA 2: PORCENTAJES DE MOMENTOS */}
        <p className="text-center mb-4">
          <span className="text-sm text-[#0f4899]">Tabla 2. </span>
          <span className="font-bold text-[#0f4899] text-lg">
            Porcentajes de los Momentos de Aprendizaje
          </span>
        </p>

        <table className="w-full border-collapse border border-[#ff9900] mb-10 bg-white">
          <thead>
            <tr className="bg-[#ff9900]">
              <th colSpan={currentStation.moments.length + 1} className="text-center px-5 py-3 text-white font-bold text-base border border-[#ff9900]">
                Momentos de Aprendizaje
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center w-40 border border-[#ff9900]">Momento</td>
              {currentStation.moments.map((m: LearningMoment) => (
                <td key={m.id} className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">
                  {m.name.split('/')[0]}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center border border-[#ff9900]">Duración</td>
              {currentStation.moments.map((_, i) => (
                <td key={`dur-${i}`} className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">
                  {i === 0 ? '1 sem.' : i === 1 ? '5 sem.' : '2 sem.'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center border border-[#ff9900]">Porcentaje</td>
              {currentStation.moments.map((m) => (
                <td key={`pct-${m.id}`} className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">
                  {m.weight}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* TABLA 3: EVALUACIÓN FORMATIVA Y SUMATIVA */}
        <p className="text-center mb-4">
          <span className="text-sm text-[#0f4899]">Tabla 3. </span>
          <span className="font-bold text-lg text-[#0f4899]">
            Reporte Evaluación Formativa y Sumativa
          </span>
        </p>

        <table className="w-full border-collapse border border-[#ff9900] bg-white">
          <thead>
            <tr className="bg-[#0f4899]">
              <th rowSpan={2} className="px-4 py-2 font-bold text-xs w-40 border border-white text-white">
                ÁREA
              </th>
              <th colSpan={currentStation.moments.length} className="text-center px-4 py-2 font-bold text-xs border border-white text-white">
                MOMENTOS DE APRENDIZAJE
              </th>
              <th rowSpan={2} className="px-4 py-2 font-bold text-xs text-center border border-white text-white">
                VALORACIÓN
              </th>
            </tr>
            <tr className="bg-[#0f4899]">
              {currentStation.moments.map((m: LearningMoment) => (
                <th key={m.id} className="px-3 py-1 font-bold text-[10px] text-center border border-white text-white">
                  {m.name.split('/')[0]}<br />({m.weight}%)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(labs).map(([labName, items]) => {
              const style = labsStyles[labName] || labsStyles.General;
              return (
                <React.Fragment key={labName}>
                  <tr className="bg-slate-50 border-b border-[#ff9900]">
                    <td colSpan={currentStation.moments.length + 2} className="px-4 py-2">
                      <div className="font-bold text-sm" style={{ color: style.color }}>{style.name}</div>
                      <div className="font-bold text-xs opacity-80" style={{ color: style.color }}>{style.desc}</div>
                    </td>
                  </tr>
                  {items.map((r: ReportSubject) => (
                    <React.Fragment key={r.subject.id}>
                      <tr className="border-b border-[#ff9900]">
                        <td className="px-4 py-2 font-bold text-xs border-r border-[#ff9900] " style={{ color: style.color }}>
                          {r.subject.name}
                        </td>
                        {r.momentResults.map((m: any) => (
                          <td key={m.id} className="px-2 py-4 text-center border-r border-[#ff9900]">
                            <span className="text-xs  font-black text-[#0f4899]">
                              {m.hasData ? (m.average >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-2 text-[#0f4899] text-xs font-black text-center">
                          {r.finalStationAvg > 0 ? (r.finalStationAvg >= 3.7 ? 'Consolidado' : 'No Consolidado') : '—'}
                        </td>
                      </tr>
                      <tr className="border-b border-[#ff9900]">
                        <td className="px-4 py-2 font-bold text-[#ff9900] text-xs border-r border-[#ff9900] bg-slate-50">
                          Habilidades {r.subject.name}
                        </td>
                        <td colSpan={currentStation.moments.length + 1} className="px-4 py-3 text-[11px] text-[#0f4899] italic ">
                          {r.selectedSkills && r.selectedSkills.length > 0 
                            ? r.selectedSkills.join('. ') 
                            : "Proceso de aprendizaje en desarrollo para este nivel."}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ReportFooter />
    </div>
  )
}
export default MomentosPage;
