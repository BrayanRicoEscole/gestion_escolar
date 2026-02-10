import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";

const HabilidadesPage = () => <div className="report-page relative border border-border shadow-lg p-8 pb-14 px-0 py-0">

    <ReportHeader />

    <div className="mt-10 relative z-10 px-[50px]">
      <p className="text-center mb-4">
        <span className="text-sm text-muted-foreground">Tabla 4. </span>
        <span className="font-montserrat font-bold text-report-blue text-lg">
          Reporte Global de Aprendizaje
        </span>
      </p>

      <div className="border border-report-orange/30 overflow-hidden">
        {/* VALORACIÓN CUALITATIVA header */}
        <div className="bg-report-orange px-5 py-3">
          <h3 className="font-montserrat font-bold text-secondary-foreground text-sm tracking-wide">
            VALORACIÓN CUALITATIVA
          </h3>
        </div>

        {/* APRENDIZAJE ACADÉMICO */}
        <div className="bg-report-header-bg px-5 py-2">
          <h4 className="font-montserrat font-bold text-primary-foreground text-sm">
            APRENDIZAJE ACADÉMICO
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2">
          <p className="text-sm">
            <span className="font-bold text-foreground">● Habilidades consolidadas por la seed: </span>
            <span className="text-muted-foreground">&lt;&lt;academic_cons&gt;&gt;</span>
          </p>
          <p className="text-sm">
            <span className="font-bold text-foreground">● Habilidades no consolidadas por la seed: </span>
            <span className="text-muted-foreground">&lt;&lt;academic_non&gt;&gt;</span>
          </p>
          <p className="text-sm">
            <span className="font-bold text-foreground">● Reporte de los Learning Crops Descripción de la vivencia de aprendizaje práctico y el rol de la seed: </span>
            <span className="text-muted-foreground">&lt;&lt;learning_crop_desc&gt;&gt;</span>
          </p>
        </div>

        {/* APRENDIZAJE EMOCIONAL */}
        <div className="bg-report-header-bg px-5 py-2">
          <h4 className="font-montserrat font-bold text-primary-foreground text-sm">
            APRENDIZAJE EMOCIONAL
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2">
          <p className="text-sm">
            <span className="font-bold text-foreground">● Habilidades socioemocionales que se fortalecieron con la seed: </span>
            <span className="text-muted-foreground">&lt;&lt;emotional_skills&gt;&gt;</span>
          </p>
          <p className="text-sm">
            <span className="font-bold text-foreground">● Talentos que la seed ha demostrado: </span>
            <span className="text-muted-foreground">&lt;&lt;talents&gt;&gt;</span>
          </p>
        </div>

        {/* APRENDIZAJE CONVIVENCIAL */}
        <div className="bg-report-header-bg px-5 py-2">
          <h4 className="font-montserrat font-bold text-primary-foreground text-sm">
            APRENDIZAJE CONVIVENCIAL
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2">
          <p className="text-sm">
            <span className="font-bold text-foreground">● Habilidades de interacción y cooperación que se fortalecieron con la seed: </span>
            <span className="text-muted-foreground">&lt;&lt;Interacción y cooperación&gt;&gt;</span>
          </p>
          <p className="text-sm">
            <span className="font-bold text-foreground">● Desafíos que inciden en el clima escolar: </span>
            <span className="text-muted-foreground">&lt;&lt;challenges&gt;&gt;</span>
          </p>
          <p className="text-sm">
            <span className="font-bold text-foreground">● Aplicación y Desarrollo del Plan Individual de Ajuste Razonable (PIAR): </span>
            <span className="text-muted-foreground">&lt;&lt;piar_desc&gt;&gt;</span>
          </p>
        </div>

        {/* Comentario del TL */}
        <div className="px-5 py-3 border-t border-report-orange/20">
          <p className="text-sm">
            <span className="font-montserrat font-bold text-report-blue">Comentario del TL: </span>
            <span className="text-muted-foreground">&lt;&lt;comment&gt;&gt;</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-foreground">
        Emitido el &lt;&lt;date&gt;&gt; por <span className="font-bold">Andrea Gómez</span> / Secretaría Académica
      </div>
    </div>

    <ReportFooter />
  </div>;
export default HabilidadesPage;