import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import {StudentComment} from 'types'
interface Props {
  
    comment?: StudentComment;
  
}

const HabilidadesPage: React.FC<Props> = ({ comment}) => <div className="report-page relative border border-border shadow-lg p-8 pb-14 px-0 py-0">

    <ReportHeader />

    <div className="mt-10 relative z-10 px-[50px]">
      <p className="text-center mb-4">
        <span className="text-sm text-[#0f4899]">Tabla 4. </span>
        <span className=" font-bold text-[#0f4899] text-lg">
          Reporte Global de Aprendizaje
        </span>
      </p>

      <div className="border border-[#ff9900] overflow-hidden">
        {/* VALORACIÓN CUALITATIVA header */}
        <div className="bg-[#ff9900] px-5 py-3 text-[#0f4899]">
          <h3 className=" font-bold text-sm text-white tracking-wide">
            VALORACIÓN CUALITATIVA
          </h3>
        </div>

        {/* APRENDIZAJE ACADÉMICO */}
        <div className="bg-[#0f4899] px-5 py-2">
          <h4 className=" font-bold  text-sm text-white">
            APRENDIZAJE ACADÉMICO
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2 text-[#0f4899]">
          <p className="text-sm">
            <span className="font-bold ">● Habilidades consolidadas por la seed: </span>
            <span className="text-[#0f4899]">{comment?.academicCons}</span>
          </p>
          <p className="text-sm">
            <span className="font-bold ">● Habilidades no consolidadas por la seed: </span>
            <span className="text-[#0f4899]">{comment?.academicNon}</span>
          </p>
          <p className="text-sm">
            <span className="font-bold ">● Reporte de los Learning Crops Descripción de la vivencia de aprendizaje práctico y el rol de la seed: </span>
            <span className="text-[#0f4899]">{comment?.learningCropDesc}</span>
          </p>
        </div>

        {/* APRENDIZAJE EMOCIONAL */}
        <div className="bg-[#0f4899] px-5 py-2">
          <h4 className=" font-bold  text-sm text-white">
            APRENDIZAJE EMOCIONAL
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2  text-[#0f4899]">
          <p className="text-sm">
            <span className="font-bold ">● Habilidades socioemocionales que se fortalecieron con la seed: </span>
            <span className="text-[#0f4899]">{comment?.emotionalSkills}</span>
          </p>
          <p className="text-sm">
            <span className="font-bold ">● Talentos que la seed ha demostrado: </span>
            <span className="text-[#0f4899]">{comment?.talents}</span>
          </p>
        </div>

        {/* APRENDIZAJE CONVIVENCIAL */}
        <div className="bg-[#0f4899] px-5 py-2">
          <h4 className=" font-bold text-sm">
            APRENDIZAJE CONVIVENCIAL
          </h4>
        </div>
        <div className="px-5 py-3 space-y-2">
          <p className="text-sm text-[#0f4899]">
            <span className="font-bold text-[#0f4899] ">● Habilidades de interacción y cooperación que se fortalecieron con la seed: </span>
            <span className="text-[#0f4899]">{comment?.socialInteraction}</span>
          </p>
          <p className="text-sm text-[#0f4899]">
            <span className="font-bold text-[#0f4899] ">● Desafíos que inciden en el clima escolar: </span>
            <span className="">{comment?.challenges}</span>
          </p>
          <p className="text-sm text-[#0f4899]">
            <span className="font-bold text-[#0f4899]">● Aplicación y Desarrollo del Plan Individual de Ajuste Razonable (PIAR): </span>
            <span className="text-[#0f4899]">{comment?.piarDesc}</span>
          </p>
        </div>

        {/* Comentario del TL */}
        <div className="px-5 py-3 border-t border-[#ff9900]">
          <p className="text-sm text-[#0f4899]">
            <span className=" font-bold text-[#0f4899]">Comentario del TL: </span>
            <span className="text-[#0f4899]">{comment?.comentary}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-[#0f4899] ">
        Emitido el {new Date().toLocaleDateString()} por Secretaría Académica
      </div>
    </div>

    <ReportFooter />
  </div>;
export default HabilidadesPage;