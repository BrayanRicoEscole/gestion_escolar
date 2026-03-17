
import React from 'react'
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import { Station, GradeEntry, Student, SchoolYear } from 'types'

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
  student: Student;
  schoolYear: SchoolYear | null;
  stations: Station[];
  // Data structure for final report: subject -> station averages
  finalData: {
    labs: Record<string, any[]>;
    generalAverage: number;
    convivenciaResults: any[];
  };
}

const FinalStationsPage: React.FC<Props> = ({ student, schoolYear, stations, finalData }) => {
  if (!student || !schoolYear) return null;

  return (
    <div className="report-page relative border border-border shadow-lg p-0 bg-white">
      <ReportHeader />

      <div className="mt-12 relative z-10 px-[50px]">
        {/* TABLA 2: PORCENTAJES DE ESTACIONES */}
        <p className="text-center mb-4">
          <span className="text-sm text-[#0f4899]">Tabla 2. </span>
          <span className="font-bold text-[#0f4899] text-lg">
            Porcentajes de las Estaciones del Año Académico
          </span>
        </p>

        <table className="w-full border-collapse border border-[#ff9900] mb-10 bg-white">
          <thead>
            <tr className="bg-[#ff9900]">
              <th colSpan={stations.length + 1} className="text-center px-5 py-3 text-white font-bold text-base border border-[#ff9900]">
                Estaciones del Año
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center w-40 border border-[#ff9900]">Estación</td>
              {stations.map((s) => (
                <td key={s.id} className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">
                  {s.name}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-2 text-[#0f4899] font-bold text-sm text-center border border-[#ff9900]">Porcentaje</td>
              {stations.map((s) => (
                <td key={`pct-${s.id}`} className="px-5 py-2 text-[#0f4899] text-sm text-center border border-[#ff9900]">
                  {s.weight}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* TABLA 3: REPORTE DE CALIFICACIONES FINALES */}
        <p className="text-center mb-4">
          <span className="text-sm text-[#0f4899]">Tabla 3. </span>
          <span className="font-bold text-lg text-[#0f4899]">
            Reporte de Calificaciones Finales
          </span>
        </p>

        <table className="w-full border-collapse border border-[#ff9900] bg-white">
          <thead>
            <tr className="bg-[#0f4899]">
              <th rowSpan={2} className="px-4 py-2 font-bold text-xs w-40 border border-white text-white">
                ÁREA
              </th>
              <th colSpan={stations.length} className="text-center px-4 py-2 font-bold text-xs border border-white text-white">
                ESTACIONES DEL AÑO
              </th>
              <th rowSpan={2} className="px-4 py-2 font-bold text-xs text-center border border-white text-white">
                PROMEDIO FINAL
              </th>
            </tr>
            <tr className="bg-[#0f4899]">
              {stations.map((s) => (
                <th key={s.id} className="px-3 py-1 font-bold text-[10px] text-center border border-white text-white">
                  {s.name}<br />({s.weight}%)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.entries(finalData.labs) as [string, any[]][]).map(([labName, items]) => {
              const style = labsStyles[labName] || labsStyles.General;
              return (
                <React.Fragment key={labName}>
                  <tr className="bg-slate-50 border-b border-[#ff9900]">
                    <td colSpan={stations.length + 2} className="px-4 py-2">
                      <div className="font-bold text-sm" style={{ color: style.color }}>{style.name}</div>
                      <div className="font-bold text-xs opacity-80" style={{ color: style.color }}>{style.desc}</div>
                    </td>
                  </tr>
                  {items.map((r: any) => (
                    <tr key={r.subject.id} className="border-b border-[#ff9900]">
                      <td className="px-4 py-2 font-bold text-xs border-r border-[#ff9900] " style={{ color: style.color }}>
                        {r.subject.name}
                      </td>
                      {r.stationResults.map((st: any) => (
                        <td key={st.id} className="px-2 py-4 text-center border-r border-[#ff9900]">
                          <span className="text-xs font-black text-[#0f4899]">
                            {st.hasData ? st.average.toFixed(2) : '—'}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-2 text-[#0f4899] text-xs font-black text-center">
                        {r.finalYearAvg > 0 ? r.finalYearAvg.toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            {/* Fila de Convivencia */}
            <tr className="bg-slate-50 border-b border-[#ff9900]">
              <td colSpan={stations.length + 2} className="px-4 py-2">
                <div className="font-bold text-sm text-[#0f4899]">🤝 CONVIVENCIA Y PROCESOS SOCIALES</div>
                <div className="font-bold text-xs text-[#0f4899] opacity-80">INTERACCIÓN Y DESARROLLO SOCIOEMOCIONAL</div>
              </td>
            </tr>
            <tr className="border-b border-[#ff9900]">
              <td className="px-4 py-2 font-bold text-xs border-r border-[#ff9900] text-[#0f4899]">
                Desempeño de Convivencia
              </td>
              {finalData.convivenciaResults.map((st: any) => (
                <td key={st.id} className="px-2 py-4 text-center border-r border-[#ff9900]">
                  <span className="text-xs font-black text-[#0f4899]">
                    {st.hasData ? st.average.toFixed(2) : '—'}
                  </span>
                </td>
              ))}
              <td className="px-4 py-2 text-[#0f4899] text-xs font-black text-center">
                {finalData.convivenciaResults.filter((r: any) => r.hasData).length > 0 
                  ? (finalData.convivenciaResults.reduce((acc: number, r: any) => acc + r.average, 0) / finalData.convivenciaResults.filter((r: any) => r.hasData).length).toFixed(2)
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ReportFooter />
    </div>
  )
}

export default FinalStationsPage;
