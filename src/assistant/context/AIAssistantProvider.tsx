import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

import { AiAssistantContext } from './AIAssistantContext';
import { useGenerateAiContent } from '../data/apiHooks';

export const AiAssistantProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    mutate: generateContent,
    isLoading: isAiLoading,
    data: aiData,
  } = useGenerateAiContent();

  const params = useParams();
  const courseId = params?.courseId;

  const value = useMemo(() => ({
    generateContent,
    isAiLoading,
    aiData,
    courseId,
  }), [generateContent, isAiLoading, aiData, courseId]);

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
};
