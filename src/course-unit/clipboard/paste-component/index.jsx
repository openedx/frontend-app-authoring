import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from '@openedx/paragon';

import { PopoverContent, PasteComponentButton, WhatsInClipboard } from './components';
import { clipboardPropsTypes, OVERLAY_TRIGGERS } from './constants';

const PasteComponent = ({ handleCreateNewCourseXBlock, clipboardData }) => {
  const [showPopover, togglePopover] = useState(false);
  const popoverElementRef = useRef(null);

  const handlePopoverToggle = (isOpen) => togglePopover(isOpen);

  const renderPopover = (props) => (
    <div role="link" ref={popoverElementRef} tabIndex="0">
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
      <PasteComponentButton
        handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
      />
      <OverlayTrigger
        show={showPopover}
        trigger={OVERLAY_TRIGGERS}
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
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
  clipboardData: PropTypes.shape(clipboardPropsTypes),
};

PasteComponent.defaultProps = {
  clipboardData: null,
};

export default PasteComponent;
