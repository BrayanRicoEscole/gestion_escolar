import { useEffect, useState } from 'react';
import { ReportTemplate } from '../../../../types';
import { listTemplates } from '../../../../services/api';

export function useTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listTemplates();
        setTemplates(data);
        if (data.length) setSelectedTemplateId(data[0].id);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading
  };
}
