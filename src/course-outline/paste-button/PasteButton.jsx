import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Hyperlink, Icon, Button, Popover, OverlayTrigger,
} from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  FileCopy as PasteIcon,
  Question as QuestionIcon,
} from '@edx/paragon/icons';
import { getInitialUserClipboard } from '../data/selectors';
import messages from './messages';

const PasteButton = ({
  text,
  blockType,
  onClick,
}) => {
  const intl = useIntl();
  const initialUserClipboard = useSelector(getInitialUserClipboard);
  const {
    content,
    sourceContextTitle,
    sourceEditUrl,
  } = initialUserClipboard || {};
  // Show button only if clipboard has content
  const showPasteButton = (
    content?.status === 'ready'
    && content?.blockType === blockType
  );

  const [show, setShow] = useState(false);
  const handleOnMouseEnter = () => {
    setShow(true);
  };
  const handleOnMouseLeave = () => {
    setShow(false);
  };
  const ref = useRef(null);

  if (!showPasteButton) {
    return null;
  }

  const renderBlockLink = (props) => (
    <Popover
      id={`${blockType}-paste-button-overlay`}
      className="p-0"
      {...props}
    >
      <Hyperlink
        className="d-flex bg-white p-3 text-decoration-none"
        target="_blank"
        destination={sourceEditUrl}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      >
        <div className="text-gray mr-5 mw-xs">
          <h4>
            {content?.displayName}<br />
            <span className="micro text-gray-400">
              {content?.blockTypeDisplay}
            </span>
          </h4>
          <span className="x-small">
            {intl.formatMessage(messages.clipboardContentFromLabel)}
            <em>{sourceContextTitle}</em>
          </span>
        </div>
      </Hyperlink>
    </Popover>
  );

  return (
    <>
      <Button
        className="mt-4"
        variant="outline-primary"
        iconBefore={PasteIcon}
        block
        onClick={onClick}
      >
        {text}
      </Button>
      <OverlayTrigger
        key={`${blockType}-paste-button-overlay`}
        show={show}
        placement="top"
        container={ref}
        overlay={renderBlockLink}
      >
        <span
          className="float-right d-inline-flex align-items-center x-small mt-2"
          ref={ref}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        >
          <Icon size="sm" src={QuestionIcon} />
          {intl.formatMessage(messages.clipboardContentLabel)}
        </span>
      </OverlayTrigger>
    </>
  );
};

PasteButton.propTypes = {
  text: PropTypes.string.isRequired,
  blockType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PasteButton;
