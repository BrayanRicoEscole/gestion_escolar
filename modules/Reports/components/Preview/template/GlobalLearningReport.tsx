
import React from 'react';
import CoverPage from "./CoverPage";
import StudentInfoPage from "./StudentInfoPage";
import MomentosPage from "./MomentosPage";
import HabilidadesPage from "./HabilidadesPage";
import { Student, SchoolYear, GradeEntry, StudentComment, Station, SkillSelection } from '../../../../../types';

interface Props {
  student: Student;
  schoolYear: SchoolYear | null;
  currentStation: Station | null;
  grades: GradeEntry[];
  comment?: StudentComment;
  skillSelections: SkillSelection[];
}

const GlobalLearningReport: React.FC<Props> = ({
  student,
  schoolYear,
  currentStation,
  grades,
  comment,
  skillSelections
}) => {
  return(
  <div className="min-h-screen bg-muted/50 py-8 px-4 flex flex-col items-center gap-8">
    <CoverPage />
    <StudentInfoPage 
      student={student}
      schoolYear={schoolYear}
      currentStation={currentStation}
    />
    <MomentosPage
      currentStation={currentStation}
      grades={grades}
      student={student}
      skillSelections={skillSelections}
    />
    <HabilidadesPage 
      comment={comment}
    />
  </div>)
  }


export default GlobalLearningReport;
