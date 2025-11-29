export type MessageType = 'user' | 'ai';

export interface AssistantMessage {
  id: string;
  type: MessageType;
  text: string;
  variant?: 'success' | 'danger';
}

export interface GenerateAiContentReqI {
  course_id: string;
  xblock_type: string;
  prompt: string;
}

export interface GenerateAiContentResI {
  content: string;
}

export interface AiAssistantContextType {
  generateContent: (values: GenerateAiContentReqI) => void;
  isAiLoading: boolean;
  aiData: GenerateAiContentResI | undefined;
  courseId: string | undefined;
}

export interface UseAIAssistantChatPropsI {
  xblockType: string;
}

export interface AssistantEditorFormPropI {
  messages: AssistantMessage[];
  onSend: (prompt: string) => void;
  isLoading: boolean;
  isReady: boolean;
  placeholder?: string;
}
