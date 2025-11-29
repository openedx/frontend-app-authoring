import { createContext } from 'react';

import { AiAssistantContextType } from '../types';

export const AiAssistantContext = createContext<AiAssistantContextType | null>(null);
