import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
const MomentosPage = () => <div className="report-page relative border border-border shadow-lg p-8 pb-14 py-0 pt-0 pl-0 pr-0">

    <ReportHeader />

    <div className="mt-12 relative z-10 px-[50px]">
      <p className="text-center mb-4">
        <span className="text-sm text-muted-foreground">Tabla 2. </span>
        <span className="font-montserrat font-bold text-report-blue text-lg">
          Porcentajes de los Momentos de Aprendizaje
        </span>
      </p>

      <table className="w-full border border-report-orange/40 rounded-lg overflow-hidden mb-10">
        <thead>
          <tr className="bg-report-orange">
            <th colSpan={5} className="text-center px-5 py-3 text-secondary-foreground font-montserrat font-bold text-base">
              Momentos de Aprendizaje
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-report-orange/20 bg-background">
            <td className="px-5 py-2 font-montserrat font-bold text-sm text-report-blue text-center w-40">Momento</td>
            <td className="px-5 py-2 text-sm text-center">Sowing</td>
            <td className="px-5 py-2 text-sm text-center">Growing</td>
            <td className="px-5 py-2 text-sm text-center">Blossom</td>
            <td className="px-5 py-2 text-sm text-center">Harvest</td>
          </tr>
          <tr className="border-b border-report-orange/20 bg-background">
            <td className="px-5 py-2 font-montserrat font-bold text-sm text-report-blue text-center">Duración</td>
            <td className="px-5 py-2 text-sm text-center">1 semana</td>
            <td className="px-5 py-2 text-sm text-center">5 semanas</td>
            <td className="px-5 py-2 text-sm text-center">2 semanas</td>
            <td className="px-5 py-2 text-sm text-center">2 semanas</td>
          </tr>
          <tr className="bg-background">
            <td className="px-5 py-2 font-montserrat font-bold text-sm text-report-blue text-center">Porcentaje</td>
            <td className="px-5 py-2 text-sm text-center">10%</td>
            <td className="px-5 py-2 text-sm text-center">30%</td>
            <td className="px-5 py-2 text-sm text-center">30%</td>
            <td className="px-5 py-2 text-sm text-center">30%</td>
          </tr>
        </tbody>
      </table>

      <p className="text-center mb-4">
        <span className="text-sm text-muted-foreground">Tabla 3. </span>
        <span className="font-montserrat font-bold text-report-blue text-lg">
          Reporte Evaluación Formativa y Sumativa
        </span>
      </p>

      <table className="w-full border border-report-orange/40 overflow-hidden">
        <thead>
          <tr className="bg-report-header-bg">
            <th rowSpan={2} className="px-4 py-2 text-primary-foreground font-montserrat font-bold text-xs w-40 border-r border-primary-foreground/20">
              ÁREA
            </th>
            <th colSpan={4} className="text-center px-4 py-2 text-primary-foreground font-montserrat font-bold text-xs border-r border-primary-foreground/20">
              MOMENTOS DE APRENDIZAJE
            </th>
            <th rowSpan={2} className="px-4 py-2 text-primary-foreground font-montserrat font-bold text-xs text-center">
              VALORACIÓN
            </th>
          </tr>
          <tr className="bg-report-header-bg">
            <th className="px-3 py-1 text-primary-foreground font-montserrat font-bold text-[10px] text-center border-r border-primary-foreground/20">SOWING<br />(10%)</th>
            <th className="px-3 py-1 text-primary-foreground font-montserrat font-bold text-[10px] text-center border-r border-primary-foreground/20">GROWING<br />(30%)</th>
            <th className="px-3 py-1 text-primary-foreground font-montserrat font-bold text-[10px] text-center border-r border-primary-foreground/20">BLOSSOM<br />(30%)</th>
            <th className="px-3 py-1 text-primary-foreground font-montserrat font-bold text-[10px] text-center border-r border-primary-foreground/20">HARVEST<br />(30%)</th>
          </tr>
        </thead>
        <tbody>
          {/* LABORATORIO CLEPE */}
          <tr className="border-b border-report-orange/30 bg-muted/20">
            <td colSpan={6} className="px-4 py-2">
              <div className="font-montserrat font-bold text-report-blue text-sm">📖 LABORATORIO CLEPE</div>
              <div className="font-montserrat font-bold text-report-orange text-xs">CUERPO, LETRAS Y PENSAMIENTO</div>
            </td>
          </tr>
          <tr className="border-b border-report-orange/20">
            <td className="px-4 py-2 font-montserrat font-bold text-report-orange text-xs border-r border-report-orange/20">Habilidades Lenguaje</td>
            <td colSpan={4} className="px-4 py-2 text-sm text-muted-foreground border-r border-report-orange/20">&lt;&lt;Habilidades Lenguaje&gt;&gt;</td>
            <td className="px-4 py-2"></td>
          </tr>

          {/* LABORATORIO ONDA */}
          <tr className="border-b border-report-orange/30 bg-muted/20">
            <td colSpan={6} className="px-4 py-2">
              <div className="font-montserrat font-bold text-report-blue text-sm">🏃 LABORATORIO ONDA</div>
              <div className="font-montserrat font-bold text-report-orange text-xs">CREATIVIDAD, JUEGO Y MOVIMIENTO</div>
            </td>
          </tr>
          <tr className="border-b border-report-orange/20">
            <td className="px-4 py-2 font-montserrat font-bold text-report-orange text-xs border-r border-report-orange/20">Habilidades Taller de diseño</td>
            <td colSpan={4} className="px-4 py-2 text-sm text-muted-foreground border-r border-report-orange/20">&lt;&lt;Habilidades Taller de Diseño&gt;&gt;</td>
            <td className="px-4 py-2"></td>
          </tr>

          {/* LABORATORIO MEC */}
          <tr className="border-b border-report-orange/30 bg-muted/20">
            <td colSpan={6} className="px-4 py-2">
              <div className="font-montserrat font-bold text-report-blue text-sm">🔬 LABORATORIO MEC</div>
              <div className="font-montserrat font-bold text-report-orange text-xs">MODELACIÓN, EXPERIMENTACIÓN Y COMPROBACIÓN</div>
            </td>
          </tr>
          <tr className="border-b border-report-orange/20">
            <td className="px-4 py-2 font-montserrat font-bold text-report-orange text-xs border-r border-report-orange/20">Habilidades Matemáticas</td>
            <td colSpan={4} className="px-4 py-2 text-sm text-muted-foreground border-r border-report-orange/20">&lt;&lt;Habilidades Matemáticas&gt;&gt;</td>
            <td className="px-4 py-2"></td>
          </tr>
          <tr className="border-b border-report-orange/20">
            <td className="px-4 py-2 font-montserrat font-bold text-report-orange text-xs border-r border-report-orange/20">Habilidades Geometría</td>
            <td colSpan={4} className="px-4 py-2 text-sm text-muted-foreground border-r border-report-orange/20">&lt;&lt;Habilidades Geometría&gt;&gt;</td>
            <td className="px-4 py-2"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReportFooter />
  </div>;
export default MomentosPage;