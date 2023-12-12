import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, Icon, IconButton } from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';

import messages from './messages';

export const TranscriptActionMenu = ({
  language,
  launchDeleteConfirmation,
  handleTranscript,
  input,
}) => (
  <Dropdown>
    <Dropdown.Toggle
      id="dropdown-toggle-with-iconbutton-video-transcript-widget"
      as={IconButton}
      src={MoreHoriz}
      iconAs={Icon}
      variant="primary"
      alt="Actions dropdown"
      data-testid={`${language}-transcript-menu`}
    />
    <Dropdown.Menu className="video_transcript position-fixed">
      <Dropdown.Item
        key={`transcript-actions-${language}-replace`}
        onClick={input.click}
      >
        <FormattedMessage {...messages.replaceTranscript} />
      </Dropdown.Item>
      <Dropdown.Item
        key={`transcript-actions-${language}-download`}
        onClick={() => handleTranscript({ language }, 'download')}
      >
        <FormattedMessage {...messages.downloadTranscript} />
      </Dropdown.Item>
      <Dropdown.Item key={`transcript-actions-${language}-delete`} onClick={launchDeleteConfirmation}>
        <FormattedMessage {...messages.deleteTranscript} />
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

TranscriptActionMenu.propTypes = {
  language: PropTypes.string.isRequired,
  handleTranscript: PropTypes.func.isRequired,
  launchDeleteConfirmation: PropTypes.func.isRequired,
  input: PropTypes.shape({
    click: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(TranscriptActionMenu);
