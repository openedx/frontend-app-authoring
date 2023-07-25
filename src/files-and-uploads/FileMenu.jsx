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
  handleDelete,
  handleLock,
  locked,
  openAssetInfo,
  portableUrl,
  iconSrc,
  // injected
  intl,
}) => (
  <Dropdown>
    <Dropdown.Toggle
      id="dropdown-toggle-with-iconbutton"
      as={IconButton}
      src={iconSrc}
      iconAs={Icon}
      variant="primary"
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
      <Dropdown.Item href={externalUrl} target="_blank" download>
        {intl.formatMessage(messages.downloadTitle)}
      </Dropdown.Item>
      <Dropdown.Item onClick={handleLock}>
        {locked ? intl.formatMessage(messages.lockMenuTitle) : intl.formatMessage(messages.unlockMenuTitle) }
      </Dropdown.Item>
      <Dropdown.Item onClick={openAssetInfo}>
        {intl.formatMessage(messages.infoTitle)}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleDelete}>
        {intl.formatMessage(messages.deleteTitle)}
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

FileMenu.propTypes = {
  externalUrl: PropTypes.string.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleLock: PropTypes.func.isRequired,
  locked: PropTypes.bool.isRequired,
  openAssetInfo: PropTypes.func.isRequired,
  portableUrl: PropTypes.string.isRequired,
  iconSrc: PropTypes.node.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileMenu);
