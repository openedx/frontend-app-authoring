import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';

import {
  ModalDialog,
  Stack,
  IconButton,
  ActionRow,
  Icon,
  Truncate,
  IconButtonWithTooltip,
  CheckboxControl,
} from '@edx/paragon';
import { ContentCopy, InfoOutline } from '@edx/paragon/icons';
import AssetThumbnail from './FileThumbnail';

import messages from './messages';

const FileInfo = ({
  asset,
  isOpen,
  onClose,
  handleLockedAsset,
  // injected
  intl,
}) => {
  const [lockedState, setLockedState] = useState(asset.locked);
  const handleLock = (e) => {
    const locked = e.target.checked;
    setLockedState(locked);
    handleLockedAsset(asset.id, locked);
  };

  return (
    <ModalDialog
      title={asset.displayName}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hasCloseButton
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {asset.displayName}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="pt-0 x-small">
        <hr />
        <div className="row flex-nowrap m-0 mt-4">
          <div className="col-7 mr-3">
            <AssetThumbnail
              thumbnail={asset.thumbnail}
              externalUrl={asset.externalUrl}
              displayName={asset.displayName}
              wrapperType={asset.wrapperType}
            />
          </div>
          <Stack>
            <div className="font-weight-bold">
              <FormattedMessage {...messages.dateAddedTitle} />
            </div>
            {asset.dateAdded}
            <div className="font-weight-bold mt-3">
              <FormattedMessage {...messages.fileSizeTitle} />
            </div>
            {/* {asset.fileSize} */}
            <hr />
            <div className="font-weight-bold mt-3">
              <FormattedMessage {...messages.studioUrlTitle} />
            </div>
            <ActionRow>
              <Truncate lines={1}>
                {asset.portableUrl}
              </Truncate>
              <ActionRow.Spacer />
              <IconButton
                src={ContentCopy}
                iconAs={Icon}
                alt={messages.copyStudioUrlTitle.defaultMessage}
                onClick={() => navigator.clipboard.writeText(asset.portableUrl)}
              />
            </ActionRow>
            <div className="font-weight-bold mt-3">
              <FormattedMessage {...messages.webUrlTitle} />
            </div>
            <ActionRow>
              <Truncate lines={1}>
                {asset.externalUrl}
              </Truncate>
              <ActionRow.Spacer />
              <IconButton
                src={ContentCopy}
                iconAs={Icon}
                alt={messages.copyWebUrlTitle.defaultMessage}
                onClick={() => navigator.clipboard.writeText(asset.externalUrl)}
              />
            </ActionRow>
            <hr />
            <ActionRow>
              <div className="font-weight-bold">
                <FormattedMessage {...messages.lockFileTitle} />
              </div>
              <IconButtonWithTooltip
                key="lock-file-info"
                tooltipPlacement="top"
                tooltipContent={intl.formatMessage(messages.lockFileTooltipContent)}
                src={InfoOutline}
                iconAs={Icon}
                alt="Info"
                size="inline"
              />
              <ActionRow.Spacer />
              <CheckboxControl
                checked={lockedState}
                onChange={handleLock}
                aria-label="Checkbox"
              />
            </ActionRow>
          </Stack>
        </div>
        <div className="row m-0 pt-3 font-weight-bold">
          <FormattedMessage {...messages.usageTitle} />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

FileInfo.propTypes = {
  asset: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    externalUrl: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    id: PropTypes.string.isRequired,
    portableUrl: PropTypes.string.isRequired,
    dateAdded: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleLockedAsset: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileInfo);
