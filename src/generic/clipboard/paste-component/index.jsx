import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from '@openedx/paragon';

import { PopoverContent, PasteButton, WhatsInClipboard } from './components';
import { clipboardPropsTypes } from './constants';

const PasteComponent = ({
  onClick, clipboardData, text, className,
}) => {
  const [showPopover, togglePopover] = useState(false);
  const popoverElementRef = useRef(null);

  const handlePopoverToggle = (isOpen) => togglePopover(isOpen);

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
        {clipboardData && (
          <PopoverContent clipboardData={clipboardData} />
        )}
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

PasteComponent.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  clipboardData: PropTypes.shape(clipboardPropsTypes),
  blockType: PropTypes.string,
  className: PropTypes.string,
};

PasteComponent.defaultProps = {
  clipboardData: null,
  blockType: null,
  className: undefined,
};

export default PasteComponent;
