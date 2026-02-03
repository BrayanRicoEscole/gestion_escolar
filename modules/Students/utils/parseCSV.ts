export const parseCSV = (text: string) => {
  const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
  const headers = header.split(',').map(h => h.replace(/"/g, ''));

  return rows.map(row => {
    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return headers.reduce((acc, h, i) => {
      acc[h] = values[i]?.replace(/"/g, '');
      return acc;
    }, {} as any);
  });
};
