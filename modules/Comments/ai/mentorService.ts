
import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './mentorPrompt';
import { StudentComment } from 'types'

export async function generateMentorSuggestion(
  comment: StudentComment
): Promise<MentorAIResult> {
  // Fix: Initialize GoogleGenAI inside the function to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const promptData = `
SÍNTESIS ACTUAL: ${comment.comentary || '(Vacío)'}

ACADÉMICO:
- Consolidadas: ${comment.academicCons}
- No consolidadas: ${comment.academicNon}

EMOCIONAL:
- Habilidades: ${comment.emotionalSkills}
- Talentos: ${comment.talents}

CONVIVENCIAL:
- Interacción: ${comment.socialInteraction}
- Desafíos: ${comment.challenges}

PIAR: ${comment.piarDesc}
// Fix: property name was learningCropDesc, should be learning_crop_desc
LEARNING CROP: ${comment.learning_crop_desc}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera o mejora el Comentario de Síntesis Final:\n${promptData}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          improvedVersion: { type: Type.STRING },
        },
        required: ['score', 'analysis', 'improvedVersion'],
      },
    },
  });

  return JSON.parse(response.text || '{}') as MentorAIResult;
}

export interface MentorAIResult {
  score: number;
  analysis: string;
  improvedVersion: string;
}
