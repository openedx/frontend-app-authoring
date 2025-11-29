import { AiAssistantContextType } from '../../types';

const defaultMockContext: AiAssistantContextType = {
  generateContent: jest.fn(),
  isAiLoading: false,
  aiData: undefined,
  courseId: 'mocked-course-v1:Global+MFE+001',
};

export const useAiAssistant = jest.fn(() => defaultMockContext);
