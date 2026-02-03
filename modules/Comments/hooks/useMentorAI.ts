import { useState, useCallback } from 'react';
import { generateMentorSuggestion } from '../ai/mentorService';
import { StudentComment } from 'types';

export function useMentorAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (comment: StudentComment) => {
    if (isAnalyzing) return null;

    setIsAnalyzing(true);
    setError(null);

    try {
      return await generateMentorSuggestion(comment);
    } catch (e) {
      console.error('[MentorAI]', e);
      setError('Error al conectar con el Mentor IA');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  return {
    analyze,
    isAnalyzing,
    error,
  };
}
