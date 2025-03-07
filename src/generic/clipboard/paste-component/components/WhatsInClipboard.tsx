import { useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Question as QuestionIcon } from '@openedx/paragon/icons';

import messages from '../messages';

interface WhatsInClipboardProps {
  handlePopoverToggle: (show: boolean) => void;
  togglePopover: (show: boolean) => void;
  popoverElementRef: React.RefObject<HTMLDivElement>;
}

const WhatsInClipboard = ({
  handlePopoverToggle, togglePopover, popoverElementRef,
}: WhatsInClipboardProps) => {
  const intl = useIntl();
  const triggerElementRef = useRef(null);

  const handleKeyDown = ({ key }) => {
    if (key === 'Tab') {
      popoverElementRef.current?.focus();
      handlePopoverToggle(true);
    }
  };

  return (
    <div
      className="whats-in-clipboard mt-2 d-flex align-items-center"
      data-testid="whats-in-clipboard"
      onMouseEnter={() => handlePopoverToggle(true)}
      onMouseLeave={() => handlePopoverToggle(false)}
      onFocus={() => togglePopover(true)}
      onBlur={() => togglePopover(false)}
    >
      <Icon
        className="whats-in-clipboard-icon mr-1"
        src={QuestionIcon}
      />
      <p
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
        tabIndex={0}
        role="presentation"
        ref={triggerElementRef}
        className="whats-in-clipboard-text m-0"
        onKeyDown={handleKeyDown}
      >
        {intl.formatMessage(messages.pasteButtonWhatsInClipboardText)}
      </p>
    </div>
  );
};

export default WhatsInClipboard;
