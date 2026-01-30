import React from 'react';
import { Target } from 'lucide-react';
import { Station, Section, GradeSlot } from '../../../../../../types';

interface TableHeaderProps {
  station: Station;
  selectedSubjectId: string;
}

const getAllSlots = (section: Section): GradeSlot[] => {
  // Los slots son comunes a todas las materias
  return section.gradeSlots || [];
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  station,
  selectedSubjectId
}) => {
  return (
    <thead>
      <tr className="bg-primary text-white">
        <th className="p-6 sticky left-0 z-10 bg-primary min-w-[280px]">
          Estudiante
        </th>

        {station.moments?.map(moment => {
          const momentSlots = (moment.sections || []).reduce<GradeSlot[]>(
            (acc, section) => [...acc, ...getAllSlots(section)],
            []
          );

          if (momentSlots.length === 0) return null;

          return (
            <th
              key={moment.id}
              className="p-0 border-l border-white/10"
              colSpan={momentSlots.length + 1}
            >
              <div className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 flex justify-between items-center">
                <span>{moment.name?.split('/')[0]}</span>
                <span className="text-blue-200">Peso: {moment.weight}%</span>
              </div>

              <div className="flex border-t border-white/10">
                {moment.sections?.map(section => {
                  const slots = getAllSlots(section);
                  if (slots.length === 0) return null;

                  return (
                    <div key={section.id} className="border-r border-white/10 flex">
                      {slots.map(slot => (
                        <div
                          key={slot.id}
                          className="w-20 text-center py-2 text-[8px] font-black text-blue-200 uppercase"
                          title={slot.name}
                        >
                          {slot.name?.substring(0, 8)}..
                        </div>
                      ))}
                    </div>
                  );
                })}

                <div className="w-20 text-center py-2 text-[8px] font-black bg-white/10 text-white uppercase flex items-center justify-center gap-1 border-l border-white/10">
                  <Target size={10} /> Prom.
                </div>
              </div>
            </th>
          );
        })}

        <th className="p-6 text-center text-[10px] font-black uppercase border-l border-white/10">
          Def.
        </th>
        <th className="p-6 text-center text-[10px] font-black uppercase border-l border-white/10">
          Estado
        </th>
      </tr>
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';