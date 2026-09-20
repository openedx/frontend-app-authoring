import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
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

import messages from '../../messages';

const MoreInfoColumn = ({
  row,
  handleLock,
  handleBulkDownload,
  handleOpenFileInfo,
  handleOpenDeleteConfirmation,
  fileType,
  permissions = {
    canEditFiles: true,
    canDeleteFiles: true,
  },
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
        <Menu className="more-info-menu">
          {permissions.canEditFiles && (
            <>
              {fileType === 'video' ?
                (
                  <MenuItem
                    as={Button}
                    variant="tertiary"
                    onClick={/* istanbul ignore next */ () => {
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      navigator.clipboard.writeText(id);
                      close();
                    }}
                  >
                    <FormattedMessage {...messages.copyVideoIdTitle} />
                  </MenuItem>
                ) :
                (
                  <>
                    <MenuItem
                      as={Button}
                      variant="tertiary"
                      onClick={/* istanbul ignore next */ () => {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        navigator.clipboard.writeText(portableUrl);
                        close();
                      }}
                    >
                      <FormattedMessage {...messages.copyStudioUrlTitle} />
                    </MenuItem>
                    <MenuItem
                      as={Button}
                      variant="tertiary"
                      onClick={/* istanbul ignore next */ () => {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        navigator.clipboard.writeText(externalUrl);
                        close();
                      }}
                    >
                      <FormattedMessage {...messages.copyWebUrlTitle} />
                    </MenuItem>
                    <MenuItem
                      as={Button}
                      variant="tertiary"
                      onClick={() => handleLock(id, !locked)}
                    >
                      {locked
                        ? <FormattedMessage {...messages.unlockMenuTitle} />
                        : <FormattedMessage {...messages.lockMenuTitle} />}
                    </MenuItem>
                  </>
                )}
              <MenuItem
                as={Button}
                variant="tertiary"
                onClick={() =>
                  handleBulkDownload(
                    [{ original: { id, displayName, downloadLink } }],
                  )}
              >
                <FormattedMessage {...messages.downloadTitle} />
              </MenuItem>
            </>
          )}
          <MenuItem
            as={Button}
            variant="tertiary"
            onClick={() => handleOpenFileInfo(row.original)}
          >
            <FormattedMessage {...(fileType === 'video' ? messages.infoAndTranscriptsTitle : messages.infoTitle)} />
          </MenuItem>

          {permissions.canDeleteFiles && (
            <>
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
                <FormattedMessage {...messages.deleteTitle} />
              </MenuItem>
            </>
          )}
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
  permissions: PropTypes.shape({
    canEditFiles: PropTypes.bool,
    canDeleteFiles: PropTypes.bool,
  }),
};

MoreInfoColumn.defaultProps = {
  handleLock: null,
};

export default MoreInfoColumn;
