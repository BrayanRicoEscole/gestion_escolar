import { TemplatePicker } from './TemplatePicker';


export const DimensionBlock = ({ title, icon, color, fields, current, templates, studentLevel, isEditable, onUpdate }: any) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col text-black">
      <div className={`p-6 flex items-center gap-4 ${color}`}>
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
        <h3 className="font-black uppercase tracking-widest text-sm">{title}</h3>
      </div>
      <div className="p-8 space-y-6 flex-1 text-black">
        {fields.map((f: any) => (
          <div key={f.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
              <TemplatePicker templates={templates} fieldKey={f.tKey} level={studentLevel} onSelect={(text: string) => { const prev = current[f.key] || ''; onUpdate(f.key, prev ? `${prev}\n${text}` : text); }} />
            </div>
            <textarea value={current[f.key] || ''} onChange={e => onUpdate(f.key, e.target.value)} disabled={!isEditable} className="w-full min-h-[120px] p-5 rounded-2xl bg-slate-50 border-none text-black text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none shadow-inner" />
          </div>
        ))}
      </div>
    </div>
  );
};

DimensionBlock.displayName = "DimensionBlock";