import { Globe, Mail } from "lucide-react";

const ReportFooter = () => (
  <div className="absolute bottom-0 left-0 right-0 px-8 py-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-report-orange-light/40 bg-background z-10">
    <span>Resoluciones 110779, 110357, 110304, 08-0142 y 08-100 de la Secretaría de Educación de Bogotá D.C</span>
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1">
        <Globe className="w-3 h-3" /> www.renfort.edu.co
      </span>
      <span>Renfortcol</span>
      <span className="flex items-center gap-1">
        <Mail className="w-3 h-3" /> info@renfort.edu.co
      </span>
    </div>
  </div>
);

export default ReportFooter;
