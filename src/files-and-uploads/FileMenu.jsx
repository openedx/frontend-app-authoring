import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  IconButton,
  Icon,
} from '@edx/paragon';
import messages from './messages';

const FileMenu = ({
  externalUrl,
  handleLock,
  locked,
  onDownload,
  openAssetInfo,
  openDeleteConfirmation,
  portableUrl,
  iconSrc,
  id,
  // injected
  intl,
}) => (
  <Dropdown data-testid={`file-menu-dropdown-${id}`}>
    <Dropdown.Toggle
      id={`file-menu-dropdown-${id}`}
      as={IconButton}
      src={iconSrc}
      iconAs={Icon}
      variant="primary"
      alt="asset-menu-toggle"
    />
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => navigator.clipboard.writeText(portableUrl)}
      >
        {intl.formatMessage(messages.copyStudioUrlTitle)}
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => navigator.clipboard.writeText(externalUrl)}
      >
        {intl.formatMessage(messages.copyWebUrlTitle)}
      </Dropdown.Item>
      <Dropdown.Item onClick={onDownload}>
        {intl.formatMessage(messages.downloadTitle)}
      </Dropdown.Item>
      <Dropdown.Item onClick={handleLock}>
        {locked ? intl.formatMessage(messages.unlockMenuTitle) : intl.formatMessage(messages.lockMenuTitle)}
      </Dropdown.Item>
      <Dropdown.Item onClick={openAssetInfo}>
        {intl.formatMessage(messages.infoTitle)}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item
        data-testid="open-delete-confirmation-button"
        onClick={openDeleteConfirmation}
      >
        {intl.formatMessage(messages.deleteTitle)}
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

FileMenu.propTypes = {
  externalUrl: PropTypes.string.isRequired,
  handleLock: PropTypes.func.isRequired,
  locked: PropTypes.bool.isRequired,
  onDownload: PropTypes.func.isRequired,
  openAssetInfo: PropTypes.func.isRequired,
  openDeleteConfirmation: PropTypes.func.isRequired,
  portableUrl: PropTypes.string.isRequired,
  iconSrc: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileMenu);
