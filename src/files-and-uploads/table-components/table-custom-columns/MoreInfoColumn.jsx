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
} from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';

import messages from '../../messages';

const MoreInfoColumn = ({
  row,
  handleLock,
  handleBulkDownload,
  handleOpenAssetInfo,
  handleOpenDeleteConfirmation,
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
    wrapperType,
    displayName,
  } = row.original;
  return (
    <>
      <IconButton src={MoreHoriz} iconAs={Icon} onClick={toggle} ref={setTarget} />
      <ModalPopup
        placement="left"
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        onEscapeKey={close}
        style={{

        }}
      >
        <Menu
          className="border border-light-400"
          style={{ overflowX: 'hidden', boxShadow: '0px 0px 0px #000', maxHeight: '500px' }}
        >
          {wrapperType === 'video' ? (
            <MenuItem
              as={Button}
              variant="tertiary"
              size="inline"
              onClick={() => {
                navigator.clipboard.writeText(id);
                close();
              }}
            >
              Copy video ID
            </MenuItem>
          ) : (
            <>
              <MenuItem
                as={Button}
                variant="tertiary"
                size="inline"
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
                size="inline"
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
                size="inline"
                onClick={() => handleLock(id, !locked)}
              >
                {locked ? intl.formatMessage(messages.unlockMenuTitle) : intl.formatMessage(messages.lockMenuTitle)}
              </MenuItem>
            </>
          )}
          <MenuItem
            as={Button}
            variant="tertiary"
            size="inline"
            onClick={() => handleBulkDownload(
              [{ original: { id, displayName } }],
            )}
          >
            {intl.formatMessage(messages.downloadTitle)}
          </MenuItem>
          <MenuItem
            as={Button}
            variant="tertiary"
            size="inline"
            onClick={() => handleOpenAssetInfo(row.original)}
          >
            {intl.formatMessage(messages.infoTitle)}
          </MenuItem>
          <hr className="m-0" />
          <MenuItem
            as={Button}
            variant="tertiary"
            size="inline"
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
  row: {
    original: {
      externalUrl: PropTypes.string,
      locked: PropTypes.bool,
      portableUrl: PropTypes.string,
      id: PropTypes.string.isRequired,
      wrapperType: PropTypes.string,
    }.isRequired,
  }.isRequired,
  handleLock: PropTypes.func.isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
  handleOpenAssetInfo: PropTypes.func.isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(MoreInfoColumn);
