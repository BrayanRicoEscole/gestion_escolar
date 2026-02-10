import CoverPage from "./CoverPage";
import StudentInfoPage from "./StudentInfoPage";
import MomentosPage from "./MomentosPage";
import HabilidadesPage from "./HabilidadesPage";

const GlobalLearningReport = () => (
  <div className="min-h-screen bg-muted/50 py-8 px-4 flex flex-col items-center gap-8">
    <CoverPage />
    <StudentInfoPage />
    <MomentosPage />
    <HabilidadesPage />
  </div>
);

export default GlobalLearningReport;
