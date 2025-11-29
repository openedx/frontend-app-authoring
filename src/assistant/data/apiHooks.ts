import { useMutation } from '@tanstack/react-query';

import { generateAiContent } from './api';
import { GenerateAiContentReqI } from '../types';

export const useGenerateAiContent = () => (
  useMutation({
    mutationFn: (payload: GenerateAiContentReqI) => generateAiContent(payload),
  })
);
