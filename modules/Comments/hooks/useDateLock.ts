import { useMemo } from 'react';

export function useDateLock(station: any) {
  return useMemo(() => {
    if (!station?.startDate || !station?.endDate) return true;

    const now = new Date();
    const start = new Date(station.startDate);
    const end = new Date(station.endDate);
    end.setHours(23, 59, 59, 999);

    // Locked if current date is NOT within start and end
    return now < start || now > end;
  }, [station]);
}
