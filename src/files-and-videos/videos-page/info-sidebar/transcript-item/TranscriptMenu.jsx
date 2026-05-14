import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
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

import { useWaffleFlags } from '../../../../data/apiHooks';
import { VideosPageContext } from '../../VideosPageProvider';
import messages from './messages';

export const TranscriptActionMenu = ({
  language,
  launchDeleteConfirmation,
  handleTranscript,
  input,
  onEdit,
}) => {
  const [isOpen, , close, toggle] = useToggle();
  const [target, setTarget] = useState(null);
  const { courseId } = React.useContext(VideosPageContext);
  const { enableTranscriptEditor } = useWaffleFlags(courseId);
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
          className="transcript-menu overflow-hidden"
        >
          {enableTranscriptEditor && (
            <MenuItem
              as={Button}
              variant="tertiary"
              key={`transcript-actions-${language}-edit`}
              onClick={() => {
                onEdit(language);
                close();
              }}
            >
              <FormattedMessage {...messages.editTranscript} />
            </MenuItem>
          )}
          <MenuItem
            as={Button}
            variant="tertiary"
            key={`transcript-actions-${language}-replace`}
            onClick={() => { input.click(); close(); }}
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
  onEdit: PropTypes.func,
  input: PropTypes.shape({
    click: PropTypes.func.isRequired,
  }).isRequired,
};

TranscriptActionMenu.defaultProps = {
  onEdit: () => {},
};

export default TranscriptActionMenu;
