import { useEffect, useState } from 'react';

import { useAiAssistant } from '../context/hooks';
import { UseAIAssistantChatPropsI, AssistantMessage, GenerateAiContentReqI } from '../types';

const useAIAssistantChat = ({ xblockType }: UseAIAssistantChatPropsI) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const {
    generateContent, isAiLoading, aiData, courseId,
  } = useAiAssistant();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.type === 'user' && !isAiLoading) {
      const newMessageId = `ai-${Date.now()}`;

      if (aiData) {
        setMessages((prev) => [
          ...prev,
          {
            id: newMessageId,
            type: 'ai',
            text: 'The content has been successfully generated and inserted into the editor.',
            variant: 'success',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: newMessageId,
            type: 'ai',
            text: 'Failed to generate content. Please try again.',
            variant: 'danger',
          },
        ]);
      }
    }
  }, [isAiLoading, aiData]);

  const handleSend = (prompt: string) => {
    const userPrompt = prompt.trim();
    if (!userPrompt || isAiLoading || !courseId) { return; }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        text: userPrompt,
      },
    ]);

    const payload: GenerateAiContentReqI = {
      course_id: courseId,
      xblock_type: xblockType,
      prompt: userPrompt,
    };
    generateContent(payload);
  };

  return {
    messages,
    handleSend,
    isAiLoading,
    isReady: !!courseId,
  };
};

export default useAIAssistantChat;
