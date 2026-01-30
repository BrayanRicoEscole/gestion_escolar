import React from 'react';
import { Target, Eye, EyeOff, Award } from 'lucide-react';
import { Station, Section, GradeSlot } from '../../../../../../types';

interface TableHeaderProps {
  station: Station;
  selectedSubjectId: string;
  collapsedMoments: Set<string>;
  onToggleMoment: (id: string) => void;
}

const getAllSlots = (section: Section): GradeSlot[] => {
  return section.gradeSlots || [];
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  station,
  selectedSubjectId,
  collapsedMoments,
  onToggleMoment
}) => {
  const momentsConfig = station.moments?.map(moment => {
    const isCollapsed = collapsedMoments.has(moment.id);
    const sections = moment.sections || [];
    const totalSlots = sections.reduce((acc, sec) => acc + getAllSlots(sec).length, 0);
    
    return {
      moment,
      isCollapsed,
      sections,
      totalSlots,
      colSpan: isCollapsed ? 1 : totalSlots + 1
    };
  }) || [];

  return (
    <thead>
      <tr className="bg-primary text-white">
        <th rowSpan={3} className="p-6 sticky left-0 z-30 bg-primary min-w-[280px] shadow-[4px_0_8px_rgba(0,0,0,0.1)] border-b border-white/10">
          Estudiante
        </th>

        {momentsConfig.map(({ moment, isCollapsed, colSpan }) => (
          <th
            key={`h1-${moment.id}`}
            colSpan={colSpan}
            className="p-0 border-l border-white/10 border-b border-white/10"
          >
            <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onToggleMoment(moment.id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-blue-200 hover:text-white"
                >
                  {isCollapsed ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <span className="truncate max-w-[150px]">{moment.name?.split('/')[0]}</span>
              </div>
              <span className="text-blue-200 text-[9px] whitespace-nowrap">{moment.weight}%</span>
            </div>
          </th>
        ))}

        <th rowSpan={3} className="p-4 text-center text-[10px] font-black uppercase border-l border-white/10 bg-primary/95 min-w-[80px] border-b border-white/10">
          Def.
        </th>
        <th rowSpan={3} className="p-4 text-center text-[10px] font-black uppercase border-l border-white/10 bg-primary/95 min-w-[120px] border-b border-white/10">
          Estado
        </th>
        <th rowSpan={3} className="p-4 text-center text-[10px] font-black uppercase border-l border-white/10 bg-primary/95 min-w-[180px] border-b border-white/10">
          Habilidades
        </th>
      </tr>

      <tr className="bg-primary/90 text-white">
        {momentsConfig.map(({ moment, isCollapsed, sections }) => {
          if (isCollapsed) return <th key={`h2-c-${moment.id}`} className="border-l border-white/10 border-b border-white/10 bg-white/5 py-6" />;
          return (
            <React.Fragment key={`h2-f-${moment.id}`}>
              {sections.map(section => {
                const slots = getAllSlots(section);
                if (slots.length === 0) return null;
                return (
                  <th key={`sec-${section.id}`} colSpan={slots.length} className="border-l border-white/10 border-b border-white/10 bg-white/5 px-2 py-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] font-black uppercase text-blue-50 tracking-tight leading-tight text-center">{section.name}</span>
                      <span className="text-[6px] font-bold text-blue-300 uppercase">PESO: {section.weight}%</span>
                    </div>
                  </th>
                );
              })}
              <th rowSpan={2} className="w-20 bg-white/15 border-l border-white/10 border-b border-white/10">
                 <div className="flex flex-col items-center justify-center gap-1">
                    <Target size={12} className="text-white" />
                    <span className="text-[8px] font-black uppercase">Prom.</span>
                 </div>
              </th>
            </React.Fragment>
          );
        })}
      </tr>

      <tr className="bg-primary/80 text-white">
        {momentsConfig.map(({ moment, isCollapsed, sections }) => {
          if (isCollapsed) return <th key={`h3-c-${moment.id}`} className="border-l border-white/10 border-b border-white/10 bg-white/5 py-2 text-[8px] font-black text-blue-200 uppercase">Acum.</th>;
          return (
            <React.Fragment key={`h3-f-${moment.id}`}>
              {sections.map(section => (
                getAllSlots(section).map(slot => (
                  <th key={`slot-${slot.id}`} className="w-20 p-2 border-l border-white/5 border-b border-white/10">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black text-white truncate w-16 text-center">{slot.name}</span>
                      <span className="text-[7px] font-bold text-blue-300">{slot.weight}%</span>
                    </div>
                  </th>
                ))
              ))}
            </React.Fragment>
          );
        })}
      </tr>
    </thead>
  );
};