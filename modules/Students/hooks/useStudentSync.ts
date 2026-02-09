import { useState } from 'react';
import { syncStudentsFromSpreadsheet } from '../../../services/api';
import { parseCSV } from '../utils/parseCSV';

// Updated hook to match ActiveStudentsModule expectations:
// 1. Accepts an object with onSuccess callback.
// 2. Returns syncing, status, syncFromSpreadsheet, and syncFromFile.
export const useStudentSync = ({ onSuccess }: { onSuccess: () => void }) => {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const sync = async (data: any[]) => {
    setSyncing(true);
    setStatus(null);
    try {
      const res = await syncStudentsFromSpreadsheet(data);
      setStatus({ type: 'success', message: `OK: ${res.success}` });
      onSuccess();
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
    } finally {
      setSyncing(false);
    }
  };

  const syncFromSpreadsheet = async (sheetId: string) => {
    setSyncing(true);
    setStatus(null);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo acceder al Spreadsheet');
      const text = await response.text();
      const data = parseCSV(text);
      await sync(data);
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message });
      setSyncing(false);
    }
  };

  const syncFromFile = (file: File) => {
    setSyncing(true);
    setStatus(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const data = parseCSV(text);
        await sync(data);
      } catch (e: any) {
        setStatus({ type: 'error', message: 'Error al procesar el archivo CSV' });
        setSyncing(false);
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Error al leer el archivo' });
      setSyncing(false);
    };
    reader.readAsText(file);
  };

  return { syncing, status, syncFromSpreadsheet, syncFromFile };
};
