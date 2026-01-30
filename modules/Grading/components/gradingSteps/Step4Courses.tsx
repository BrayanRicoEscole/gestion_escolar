
import React from 'react';
import { Modality } from '../../../../types';

export const Step4Courses: React.FC<{ 
  station: any, 
  subjectIdx: number, 
  onToggle: (idx: number, code: string) => void 
}> = ({ station, subjectIdx, onToggle }) => {
  const letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const subject = station?.subjects?.[subjectIdx];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      {[ {mod: Modality.RC, suffix: 'C', color: 'orange'}, {mod: Modality.RS, suffix: 'M', color: 'primary'}].map(config => (
        <div key={config.suffix} className="space-y-6">
          <div className={`flex items-center gap-3 p-4 bg-${config.color === 'primary' ? 'primary/5' : 'orange-50'} rounded-2xl border border-${config.color === 'primary' ? 'primary/10' : 'orange-100'}`}>
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-${config.color === 'primary' ? 'primary' : 'orange-600'} shadow-sm`}>
              {config.suffix}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{config.mod}</p>
              <p className={`text-[10px] font-bold uppercase text-${config.color === 'primary' ? 'primary' : 'orange-600'}`}>Sufijo: -{config.suffix}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {letters.map(l => numbers.map(n => {
              const code = `${l}${n}-${config.suffix}`;
              const active = subject?.courses?.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => onToggle(subjectIdx, code)}
                  className={`px-2 py-3 rounded-xl text-[10px] font-black transition-all border-2 ${active ? (config.color === 'primary' ? 'bg-primary text-white border-primary shadow-md scale-105' : 'bg-orange-600 text-white border-orange-600 shadow-md scale-105') : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20'}`}
                >
                  {code}
                </button>
              );
            }))}
          </div>
        </div>
      ))}
    </div>
  );
};
