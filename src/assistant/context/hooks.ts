import { useContext } from 'react';

import { AiAssistantContext } from './AIAssistantContext';

export const useAiAssistant = () => {
  const context = useContext(AiAssistantContext);
  if (context === null) {
    throw new Error('useAiAssistant() must be used within an AiAssistantProvider');
  }
  return context;
};
