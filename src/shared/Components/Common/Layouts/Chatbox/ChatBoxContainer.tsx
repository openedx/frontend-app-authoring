import { useCallback, useEffect } from 'react';
import { Sidebar, useSidebar } from 'shared/Components/ui/sidebar';
import iframeEvents from 'shared/constants/iframeEvents';
import { cn } from 'shared/lib/utils';

// TODO: Get from env variable
const CHATBOX_URL = 'http://localhost:3000/chatbox';

const ChatBoxContainer = () => {
  const { setOpen } = useSidebar();

  const handleCloseChatbox = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data;

      switch (type) {
        case iframeEvents.CLOSE_CHATBOX:
          handleCloseChatbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [handleCloseChatbox]);

  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      className={cn(
        'tw-w-[352px] tw-right-3',
        'tw-py-3',
      )}
    >
      <div
        className={cn(
          'tw-z-10 tw-h-full',
          'tw-border tw-border-white tw-border-solid tw-overflow-hidden',
          'tw-rounded-[20px]',
          'tw-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]',
          'tw-flex tw-flex-col tw-gap-8',
        )}
      >
        <iframe
          title="chatbox-iframe"
          id="chatbox-iframe"
          src={CHATBOX_URL}
          className="tw-h-full tw-w-full tw-border-none"
        />
      </div>
    </Sidebar>
  );
};

export default ChatBoxContainer;
