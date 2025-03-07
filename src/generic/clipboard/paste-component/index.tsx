import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from '@openedx/paragon';

import { PopoverContent, PasteButton, WhatsInClipboard } from './components';
import type { ClipboardStatus } from '../../data/api';

interface PasteComponentProps {
  onClick: () => void;
  clipboardData: ClipboardStatus;
  text: string;
  className?: string;
}

const PasteComponent = ({
  onClick, clipboardData, text, className,
}: PasteComponentProps) => {
  const [showPopover, togglePopover] = useState(false);
  const popoverElementRef = useRef(null);

  const handlePopoverToggle = (isOpen: boolean) => togglePopover(isOpen);

  const renderPopover = (props) => (
    <div role="link" ref={popoverElementRef} tabIndex={0}>
      <Popover
        className="clipboard-popover"
        id="popover-positioned"
        onMouseEnter={() => handlePopoverToggle(true)}
        onMouseLeave={() => handlePopoverToggle(false)}
        onFocus={() => handlePopoverToggle(true)}
        onBlur={() => handlePopoverToggle(false)}
        {...props}
      >
        <PopoverContent clipboardData={clipboardData} />
      </Popover>
    </div>
  );

  return (
    <>
      <PasteButton className={className} onClick={onClick} text={text} />
      <OverlayTrigger
        show={showPopover}
        overlay={renderPopover}
      >
        <WhatsInClipboard
          handlePopoverToggle={handlePopoverToggle}
          togglePopover={togglePopover}
          popoverElementRef={popoverElementRef}
        />
      </OverlayTrigger>
    </>
  );
};

export default PasteComponent;
