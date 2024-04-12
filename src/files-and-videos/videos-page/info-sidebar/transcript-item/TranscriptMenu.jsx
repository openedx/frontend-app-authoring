import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Icon,
  IconButton,
  ModalPopup,
  Menu,
  MenuItem,
  useToggle,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';

import messages from './messages';

export const TranscriptActionMenu = ({
  language,
  launchDeleteConfirmation,
  handleTranscript,
  input,
}) => {
  const [isOpen, , close, toggle] = useToggle();
  const [target, setTarget] = useState(null);
  return (
    <>
      <IconButton
        src={MoreHoriz}
        iconAs={Icon}
        onClick={toggle}
        ref={setTarget}
        alt="Actions dropdown"
        data-testid={`${language}-transcript-menu`}
      />
      <ModalPopup
        placement="bottom-end"
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        onEscapeKey={close}
      >
        <Menu
          className="transcript-menu"
        >
          <MenuItem
            as={Button}
            variant="tertiary"
            key={`transcript-actions-${language}-replace`}
            onClick={input.click}
          >
            <FormattedMessage {...messages.replaceTranscript} />
          </MenuItem>
          <MenuItem
            as={Button}
            variant="tertiary"
            key={`transcript-actions-${language}-download`}
            onClick={() => handleTranscript({ language }, 'download')}
          >
            <FormattedMessage {...messages.downloadTranscript} />
          </MenuItem>
          <hr className="my-2" />
          <MenuItem
            as={Button}
            variant="tertiary"
            key={`transcript-actions-${language}-delete`}
            onClick={launchDeleteConfirmation}
          >
            <FormattedMessage {...messages.deleteTranscript} />
          </MenuItem>
        </Menu>
      </ModalPopup>
    </>
  );
};

TranscriptActionMenu.propTypes = {
  language: PropTypes.string.isRequired,
  handleTranscript: PropTypes.func.isRequired,
  launchDeleteConfirmation: PropTypes.func.isRequired,
  input: PropTypes.shape({
    click: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(TranscriptActionMenu);
