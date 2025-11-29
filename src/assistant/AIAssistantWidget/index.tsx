import { Popover, OverlayTrigger, Button } from '@openedx/paragon';
import { Chat } from '@openedx/paragon/icons';

import AIAssistantChat from '../AIAssistantChat';
import useAIAssistantChat from '../AIAssistantChat/hooks';
import { UseAIAssistantChatPropsI } from '../types';

const AIAssistantWidget = ({ xblockType }: UseAIAssistantChatPropsI) => {
  const {
    messages,
    handleSend,
    isAiLoading,
    isReady,
  } = useAIAssistantChat({ xblockType });

  const chatPopover = (
    <Popover id="ai-assistant-popover" title="AI Assistant">
      <div className="p-2">
        <AIAssistantChat
          messages={messages}
          onSend={handleSend}
          isLoading={isAiLoading}
          isReady={isReady}
          placeholder="Generate content"
        />
      </div>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-end"
      overlay={chatPopover}
      rootClose
    >
      <Button
        variant="primary"
        className="mr-2"
        iconBefore={Chat}
        data-testid="ai-assistant-widget-button"
        type="button"
      >
        Create with AI
      </Button>
    </OverlayTrigger>
  );
};

export default AIAssistantWidget;
