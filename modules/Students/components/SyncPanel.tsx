import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

/* ===================== Types ===================== */

export interface SyncStatus {
  type: 'success' | 'error';
  message: string;
}

interface Props {
  onSyncFromSheet: (sheetId: string) => void;
  onSyncFromFile: (file: File) => void;
  syncing?: boolean;
  status?: SyncStatus | null;
}

/* ===================== Component ===================== */

export const SyncPanel: React.FC<Props> = ({
  onSyncFromSheet,
  onSyncFromFile,
  syncing = false,
  status,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetId, setSheetId] = React.useState('');

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" />
            <h3 className="text-lg font-black text-primary">
              Sincronización de Datos
            </h3>
          </div>

          <p className="text-sm text-primary/70 font-medium leading-tight">
            Sincroniza estudiantes desde Google Sheets o cargando un archivo CSV
            con las columnas requeridas.
          </p>

          {status && (
            <div
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tight
                ${
                  status.type === 'success'
                    ? 'text-green-600'
                    : 'text-rose-600'
                }`}
            >
              {status.type === 'success' ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {status.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 w-full max-w-md space-y-3">
          {/* Google Sheets */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ID del Spreadsheet público…"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-none text-sm font-bold bg-white shadow-sm focus:ring-2 focus:ring-primary/20"
            />

            <Button
              icon={RefreshCw}
              loading={syncing}
              disabled={!sheetId}
              onClick={() => onSyncFromSheet(sheetId)}
            >
              Procesar
            </Button>
          </div>

          {/* CSV Upload */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onSyncFromFile(file);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />

            <Button
              variant="outline"
              icon={FileUp}
              loading={syncing}
              onClick={() => fileInputRef.current?.click()}
            >
              Subir CSV
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
