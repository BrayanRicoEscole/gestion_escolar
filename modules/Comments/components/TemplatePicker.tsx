import React, { memo, useMemo, useState } from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { CommentTemplate } from 'types';

interface TemplatePickerProps {
  templates: CommentTemplate[];
  fieldKey: string;
  level?: string;
  onSelect: (content: string) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = memo(
  ({ templates, fieldKey, level, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const items = useMemo(() => {
      return templates.filter(
        t =>
          t.fieldKey === fieldKey &&
          (!level || t.academicLevel === level)
      );
    }, [templates, fieldKey, level]);

    return (
      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase transition-all"
        >
          <Sparkles size={12} className="text-amber-500" />
          Plantillas ({items.length})
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 p-5 max-h-64 overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <span className="text-[9px] font-black text-slate-400 uppercase">
                Sugerencias Nivel {level ?? '—'}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-slate-900 font-bold"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.content);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 hover:bg-primary/5 text-[11px] font-medium text-slate-600 rounded-xl transition-all border border-transparent hover:border-primary/10"
                >
                  {item.content}
                </button>
              ))}

              {items.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquareText
                    size={20}
                    className="mx-auto text-slate-200 mb-2"
                  />
                  <p className="text-[9px] text-slate-400 font-bold italic">
                    No hay frases guardadas para este nivel
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TemplatePicker.displayName = 'TemplatePicker';
