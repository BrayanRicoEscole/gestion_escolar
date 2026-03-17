
import React from 'react';
import CoverPage from "./CoverPage";
import StudentInfoPage from "./StudentInfoPage";
import FinalStationsPage from "./FinalStationsPage";
import { Student, SchoolYear, Station } from '../../../../../types';

interface Props {
  student: Student;
  schoolYear: SchoolYear | null;
  stations: Station[];
  finalData: {
    labs: Record<string, any[]>;
    generalAverage: number;
    convivenciaResults: any[];
  };
}

const FinalReport: React.FC<Props> = ({
  student,
  schoolYear,
  stations,
  finalData
}) => {
  return(
  <div className="min-h-screen bg-white py-8 px-4 flex flex-col items-center gap-8">
    <CoverPage />
    <StudentInfoPage 
      student={student}
      schoolYear={schoolYear}
      currentStation={stations[0] || null}
    />
    <FinalStationsPage
      student={student}
      schoolYear={schoolYear}
      stations={stations}
      finalData={finalData}
    />
  </div>)
}

export default FinalReport;
