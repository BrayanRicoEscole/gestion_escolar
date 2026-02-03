import { useState } from 'react'
import { syncStudentsFromSpreadsheet } from '../../../services/api'


export const useStudentSync = (onSuccess: () => void) => {
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

  return { sync, syncing, status };
};
