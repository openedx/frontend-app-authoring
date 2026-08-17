import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  IconButton,
  Icon,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import messages from './messages';

const FileMenu = ({
  externalUrl,
  handleLock,
  locked,
  onDownload,
  openAssetInfo,
  openDeleteConfirmation,
  portableUrl,
  id,
  fileType,
  permissions = {
    canEditFiles: true,
    canDeleteFiles: true,
  },
}) => {
  return (
    <Dropdown data-testid={`file-menu-dropdown-${id}`}>
      <Dropdown.Toggle
        id={`file-menu-dropdown-${id}`}
        as={IconButton}
        src={MoreHoriz}
        iconAs={Icon}
        variant="primary"
        alt="file-menu-toggle"
      />
      <Dropdown.Menu>
        {permissions.canEditFiles && (
          <>
            {fileType === 'video' ?
              (
                <Dropdown.Item
                  onClick={/* istanbul ignore next */ () => navigator.clipboard.writeText(id)}
                >
                  <FormattedMessage {...messages.copyVideoIdTitle} />
                </Dropdown.Item>
              ) :
              (
                <>
                  <Dropdown.Item
                    onClick={/* istanbul ignore next */ () => navigator.clipboard.writeText(portableUrl)}
                  >
                    <FormattedMessage {...messages.copyStudioUrlTitle} />
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={/* istanbul ignore next */ () => navigator.clipboard.writeText(externalUrl)}
                  >
                    <FormattedMessage {...messages.copyWebUrlTitle} />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLock}>
                    {locked
                      ? <FormattedMessage {...messages.unlockMenuTitle} />
                      : <FormattedMessage {...messages.lockMenuTitle} />}
                  </Dropdown.Item>
                </>
              )}
            <Dropdown.Item onClick={onDownload}>
              <FormattedMessage {...messages.downloadTitle} />
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Item onClick={openAssetInfo}>
          <FormattedMessage {...messages.infoTitle} />
        </Dropdown.Item>
        {permissions.canDeleteFiles && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              data-testid="open-delete-confirmation-button"
              onClick={openDeleteConfirmation}
            >
              <FormattedMessage {...messages.deleteTitle} />
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

FileMenu.propTypes = {
  externalUrl: PropTypes.string,
  handleLock: PropTypes.func,
  locked: PropTypes.bool,
  onDownload: PropTypes.func.isRequired,
  openAssetInfo: PropTypes.func.isRequired,
  openDeleteConfirmation: PropTypes.func.isRequired,
  portableUrl: PropTypes.string,
  id: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  permissions: PropTypes.shape({
    canEditFiles: PropTypes.bool,
    canDeleteFiles: PropTypes.bool,
  }),
};

FileMenu.defaultProps = {
  externalUrl: null,
  handleLock: null,
  locked: null,
  portableUrl: null,
};

export default FileMenu;
