import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Hyperlink, Icon, Button, OverlayTrigger,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  FileCopy as PasteIcon,
  Question as QuestionIcon,
} from '@openedx/paragon/icons';
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
    <Hyperlink
      id={`${blockType}-paste-button-overlay`}
      className="d-flex bg-white p-3 text-decoration-none popup-link shadow mb-2 zindex-2"
      target="_blank"
      destination={sourceEditUrl}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onFocus={handleOnMouseEnter}
      onBlur={handleOnMouseLeave}
      {...props}
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
        <div
          className="float-right d-inline-flex align-items-center x-small mt-2 cursor-help"
          ref={ref}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          onFocus={handleOnMouseEnter}
          onBlur={handleOnMouseLeave}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex="0"
        >
          <Icon className="mr-1" size="sm" src={QuestionIcon} />
          {intl.formatMessage(messages.clipboardContentLabel)}
        </div>
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
