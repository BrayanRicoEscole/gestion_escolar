import React from 'react';
import { Save, CheckCircle, Clock, Unlock } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';

/* ===== Props ===== */

interface GradingHeaderProps {
  subjectName: string;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: () => void;
}

/* ===== Component ===== */

export const GradingHeader: React.FC<GradingHeaderProps> = ({
  subjectName,
  isSaving,
  saveSuccess,
  onSave
}) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Unlock size={12} />
            Registro Abierto
          </div>

          <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} />
            Gestión 2026
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
          Libro de Calificaciones
        </h1>

        <p className="text-slate-500 font-medium">
          Materia Seleccionada:{' '}
          <span className="text-primary font-bold">
            {subjectName || 'Sin materia'}
          </span>
        </p>
      </div>

      <div className="flex gap-4 items-center">
        {saveSuccess && (
          <span className="text-green-600 font-bold text-sm flex items-center gap-2">
            <CheckCircle size={20} />
            ¡Sincronizado!
          </span>
        )}

        <Button
          onClick={onSave}
          loading={isSaving}
          icon={Save}
          size="lg"
        >
          Sincronizar Notas
        </Button>
      </div>
    </header>
  );
};

GradingHeader.displayName = 'GradingHeader';