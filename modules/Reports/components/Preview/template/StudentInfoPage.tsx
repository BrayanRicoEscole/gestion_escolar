import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";

const StudentInfoPage = () => <div className="report-page relative border border-border shadow-lg p-8 pb-14 px-0 py-0">

    <ReportHeader />

    <div className="mt-10 text-center relative z-10">
      <h2 className="font-montserrat text-3xl font-black text-report-blue">
        &lt;&lt;station_name&gt;&gt;
      </h2>
    </div>

    <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-12 relative z-10 px-[100px]">
      {[{
      label: "Seed:",
      value: "<<full_name>>"
    }, {
      label: "DI:",
      value: "<<document>>"
    }, {
      label: "Branch:",
      value: "<<Rama>>"
    }, {
      label: "Calendar:",
      value: "<<Calendar>>"
    }, {
      label: "Grade:",
      value: "<<grade>>"
    }, {
      label: "Level:",
      value: "<<academic_level>>"
    }].map(item => <div key={item.label} className="flex gap-3 items-baseline">
          <span className="font-montserrat font-bold text-report-blue text-sm">{item.label}</span>
          <span className="text-muted-foreground text-sm">{item.value}</span>
        </div>)}
    </div>

    <div className="mt-12 relative z-10 px-[90px]">
      <p className="text-center mb-4">
        <span className="text-sm text-muted-foreground">Tabla 1. </span>
        <span className="font-montserrat font-bold text-report-blue text-lg">
          Sistema de Evaluación de la Pedagogía Escole®
        </span>
      </p>

      <table className="w-full border border-report-blue/30 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-report-header-bg">
            <th className="text-left px-5 py-3 text-primary-foreground font-montserrat font-bold text-sm w-52">
              Valoración
            </th>
            <th className="text-left px-5 py-3 text-primary-foreground font-montserrat font-bold text-sm">
              Habilidad
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-report-blue/20">
            <td className="px-5 py-3 font-montserrat font-bold text-sm text-report-blue">
              🚫 No Consolidado
            </td>
            <td className="px-5 py-3 text-sm text-foreground">
              Significa que la seed aún está en proceso de consolidar las habilidades esperadas para su etapa de neurodesarrollo y aprendizaje.
            </td>
          </tr>
          <tr>
            <td className="px-5 py-3 font-montserrat font-bold text-sm text-report-blue">
              ✅ Consolidado
            </td>
            <td className="px-5 py-3 text-sm text-foreground">
              Significa que la seed consolidó las habilidades esperadas para su etapa de neurodesarrollo y aprendizaje.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReportFooter />
  </div>;
export default StudentInfoPage;