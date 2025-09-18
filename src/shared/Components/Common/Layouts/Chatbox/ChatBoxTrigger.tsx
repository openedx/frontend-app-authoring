import { Icon, Image } from '@openedx/paragon';
import React from 'react';
import { useSidebar } from 'shared/Components/ui/sidebar';
import { cn } from 'shared/lib/utils';
import BotIcon from '../../../../../assets/images/bot-small.svg';

const ChatBoxTrigger = () => {
  const { setOpen } = useSidebar();

  return (
    <div className="tw-absolute tw-bottom-3 tw-right-3 tw-z-[10000] hover:tw-animate-bounce">
      <button
        onClick={() => setOpen(true)}
        type="button"
        className={cn(
          'tw-size-12 tw-rounded-[100px] tw-border-none',
          'tw-shadow-[0px_1px_2px_0px_#1018280F,0px_1px_3px_0px_#1018281A]',
          'tw-bg-[linear-gradient(315deg,#F5C8F5_0%,#DADDFA_83.85%)]',
        )}
      >
        <Image iconAs={Icon} src={BotIcon} className="tw-size-8" />
      </button>
    </div>
  );
};

export default ChatBoxTrigger;
