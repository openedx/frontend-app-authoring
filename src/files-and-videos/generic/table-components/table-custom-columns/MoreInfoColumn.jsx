import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
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

import messages from '../../messages';

const MoreInfoColumn = ({
  row,
  handleLock,
  handleBulkDownload,
  handleOpenFileInfo,
  handleOpenDeleteConfirmation,
  fileType,
  // injected
  intl,
}) => {
  const [isOpen, , close, toggle] = useToggle();
  const [target, setTarget] = useState(null);

  const {
    externalUrl,
    locked,
    portableUrl,
    id,
    displayName,
    downloadLink,
  } = row.original;
  return (
    <>
      <IconButton
        src={MoreHoriz}
        iconAs={Icon}
        onClick={toggle}
        ref={setTarget}
        alt="More info icon button"
      />
      <ModalPopup
        placement="bottom-end"
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        onEscapeKey={close}
      >
        <Menu
          className="more-info-menu"
        >
          {fileType === 'video' ? (
            <MenuItem
              as={Button}
              variant="tertiary"
              onClick={() => {
                navigator.clipboard.writeText(id);
                close();
              }}
            >
              {intl.formatMessage(messages.copyVideoIdTitle)}
            </MenuItem>
          ) : (
            <>
              <MenuItem
                as={Button}
                variant="tertiary"
                onClick={() => {
                  navigator.clipboard.writeText(portableUrl);
                  close();
                }}
              >
                {intl.formatMessage(messages.copyStudioUrlTitle)}
              </MenuItem>
              <MenuItem
                as={Button}
                variant="tertiary"
                onClick={() => {
                  navigator.clipboard.writeText(externalUrl);
                  close();
                }}
              >
                {intl.formatMessage(messages.copyWebUrlTitle)}
              </MenuItem>
              <MenuItem
                as={Button}
                variant="tertiary"
                onClick={() => handleLock(id, !locked)}
              >
                {locked ? intl.formatMessage(messages.unlockMenuTitle) : intl.formatMessage(messages.lockMenuTitle)}
              </MenuItem>
            </>
          )}
          <MenuItem
            as={Button}
            variant="tertiary"
            onClick={() => handleBulkDownload(
              [{ original: { id, displayName, downloadLink } }],
            )}
          >
            {intl.formatMessage(messages.downloadTitle)}
          </MenuItem>
          <MenuItem
            as={Button}
            variant="tertiary"
            onClick={() => handleOpenFileInfo(row.original)}
          >
            {intl.formatMessage(messages.infoTitle)}
          </MenuItem>
          <hr className="my-2" />
          <MenuItem
            as={Button}
            variant="tertiary"
            data-testid="open-delete-confirmation-button"
            onClick={() => {
              handleOpenDeleteConfirmation([{ original: row.original }]);
              close();
            }}
          >
            {intl.formatMessage(messages.deleteTitle)}
          </MenuItem>
        </Menu>
      </ModalPopup>
    </>
  );
};

MoreInfoColumn.propTypes = {
  row: PropTypes.shape({
    original: {
      externalUrl: PropTypes.string,
      locked: PropTypes.bool,
      portableUrl: PropTypes.string,
      id: PropTypes.string.isRequired,
    }.isRequired,
  }).isRequired,
  handleLock: PropTypes.func,
  handleBulkDownload: PropTypes.func.isRequired,
  handleOpenFileInfo: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

MoreInfoColumn.defaultProps = {
  handleLock: null,
};

export default injectIntl(MoreInfoColumn);
