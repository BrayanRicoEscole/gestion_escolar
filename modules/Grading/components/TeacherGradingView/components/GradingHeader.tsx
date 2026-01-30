import React from 'react';
import { Save, CheckCircle, Clock, Unlock, Lock } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';

interface GradingHeaderProps {
  subjectName: string;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: () => void;
  isEditable?: boolean;
}

export const GradingHeader: React.FC<GradingHeaderProps> = ({
  subjectName,
  isSaving,
  saveSuccess,
  onSave,
  isEditable = true
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
        Libro de Calificaciones
      </h1>
      <p className="text-slate-500 font-medium">
        Materia: <span className="text-primary font-bold">{subjectName || 'Sin materia'}</span>
      </p>
      
      <div className="flex gap-4 items-center mt-4">
        {saveSuccess && (
          <span className="text-green-600 font-bold text-sm flex items-center gap-2">
            <CheckCircle size={20} /> ¡Sincronizado!
          </span>
        )}
        <Button
          onClick={onSave}
          loading={isSaving}
          icon={Save}
          size="lg"
          disabled={!isEditable}
          className={!isEditable ? 'opacity-50 grayscale cursor-not-allowed' : ''}
        >
          {isSaving ? 'Sincronizando...' : 'Sincronizar Notas'}
        </Button>
      </div>
    </div>
  );
};

GradingHeader.displayName = 'GradingHeader';