import React from 'react';
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import { Student, SchoolYear, GradeEntry, StudentComment, Station, SkillSelection } from '../../../../../types';

interface Props {
  student: Student;
  schoolYear: SchoolYear | null;
  currentStation: Station | null;
 
}

const StudentInfoPage: React.FC<Props> = ({
  student,
  schoolYear,
  currentStation
})=> <div className="report-page relative border border-border shadow-lg p-8 pb-14 px-0 py-0">

    <ReportHeader />

    <div className="mt-10 text-center relative z-10">
      <h2 className=" text-3xl text-[#0f4899] font-semibold">
        {currentStation.name}
      </h2>
    </div>

    <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-12 relative z-10 px-[100px]">
      {[{
      label: "Seed:",
      value: student?.full_name
    }, {
      label: "DI:",
      value: student.document
    }, {
      label: "Rama:",
      value: student.rama
    }, {
      label: "Calendar:",
      value: student.calendario
    }, {
      label: "Grade:",
      value: student.grade
    }, {
      label: "Level:",
      value: student.academic_level
    }].map(item => <div key={item.label} className="flex gap-3 items-baseline">
          <span className=" font-bold text-[#0f4899] text-sm">{item.label}</span>
          <span className="text-[#0f4899] text-sm">{item.value}</span>
        </div>)}
    </div>

    <div className="mt-12 relative z-10 px-[90px]">
      <p className="text-center mb-4">
        <span className="text-sm text-[#0f4899]">Tabla 1. </span>
        <span className=" font-bold  text-[#0f4899] text-lg">
          Sistema de Evaluación de la Pedagogía Escole®
        </span>
      </p>

      <table className="w-full border border-[#0f4899] rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#0f4899]">
            <th className="text-left px-5 py-3  text-white  font-bold text-sm w-52">
              Valoración
            </th>
            <th className="text-left px-5 py-3  text-white  font-bold text-sm">
              Habilidad
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-blue/20">
            <td className="px-5 py-3  font-bold text-sm text-[#0f4899]">
              🚫 No Consolidado
            </td>
            <td className="px-5 py-3 text-sm  text-[#0f4899]">
              Significa que la seed aún está en proceso de consolidar las habilidades esperadas para su etapa de neurodesarrollo y aprendizaje.
            </td>
          </tr>
          <tr>
            <td className="px-5 py-3  font-bold text-sm text-[#0f4899]">
              ✅ Consolidado
            </td>
            <td className="px-5 py-3 text-sm  text-[#0f4899]">
              Significa que la seed consolidó las habilidades esperadas para su etapa de neurodesarrollo y aprendizaje.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ReportFooter />
  </div>;
export default StudentInfoPage;