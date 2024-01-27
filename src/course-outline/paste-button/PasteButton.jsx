import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icon, Button, OverlayTrigger } from '@edx/paragon';
import {
  FileCopy as PasteIcon,
  Question as QuestionIcon
} from '@edx/paragon/icons';
import { getInitialUserClipboard } from '../data/selectors';

const PasteButton = ({
  text,
  blockType,
  onClick,
}) => {
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
  )

  const [show, setShow] = useState(false);
  const handleOnMouseEnter = () => {
    setShow(true);
  }
  const handleOnMouseLeave = () => {
    setShow(false);
  }
  const ref = useRef(null);

  if (!showPasteButton) {
    return null;
  }

  const renderBlockLink = (props) => (
    <Button
      as={Link}
      to={sourceEditUrl}
      variant="inverse-primary"
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      {...props}
    >
      <strong>{sourceContextTitle}</strong>
    </Button>
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
        show={show}
        key='top'
        placement='top-end'
        container={ref}
        overlay={renderBlockLink}
      >
        <span
          className="d-inline-flex"
          ref={ref}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        >
          <Icon src={QuestionIcon} />What's in my clipboard?
        </span>
      </OverlayTrigger>
    </>
  )
}

PasteButton.propTypes = {
  text: PropTypes.string.isRequired,
  blockType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default PasteButton;
