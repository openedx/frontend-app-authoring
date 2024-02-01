import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  injectIntl,
  FormattedMessage,
  FormattedDate,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Stack,
  IconButton,
  ActionRow,
  Icon,
  Truncate,
  IconButtonWithTooltip,
  CheckboxControl,
} from '@openedx/paragon';
import { ContentCopy, InfoOutline } from '@openedx/paragon/icons';

import { getFileSizeToClosestByte } from '../../utils';
import messages from './messages';

const FileInfoModalSidebar = ({
  asset,
  handleLockedAsset,
  // injected
  intl,
}) => {
  const [lockedState, setLockedState] = useState(asset?.locked);
  const handleLock = (e) => {
    const locked = e.target.checked;
    setLockedState(locked);
    handleLockedAsset(asset?.id, locked);
  };
  const fileSize = getFileSizeToClosestByte(asset?.fileSize);

  return (
    <Stack>
      <div className="font-weight-bold">
        <FormattedMessage {...messages.dateAddedTitle} />
      </div>
      <FormattedDate
        value={asset?.dateAdded}
        year="numeric"
        month="short"
        day="2-digit"
        hour="numeric"
        minute="numeric"
      />
      <div className="font-weight-bold mt-3">
        <FormattedMessage {...messages.fileSizeTitle} />
      </div>
      {fileSize}
      <div className="font-weight-bold border-top mt-3 pt-3">
        <FormattedMessage {...messages.studioUrlTitle} />
      </div>
      <ActionRow>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={1}>
            {asset?.portableUrl}
          </Truncate>
        </div>
        <ActionRow.Spacer />
        <IconButton
          src={ContentCopy}
          iconAs={Icon}
          alt={messages.copyStudioUrlTitle.defaultMessage}
          onClick={() => navigator.clipboard.writeText(asset?.portableUrl)}
        />
      </ActionRow>
      <div className="font-weight-bold mt-3">
        <FormattedMessage {...messages.webUrlTitle} />
      </div>
      <ActionRow>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={1}>
            {asset?.externalUrl}
          </Truncate>
        </div>
        <ActionRow.Spacer />
        <IconButton
          src={ContentCopy}
          iconAs={Icon}
          alt={messages.copyWebUrlTitle.defaultMessage}
          onClick={() => navigator.clipboard.writeText(asset?.externalUrl)}
        />
      </ActionRow>
      <ActionRow className=" border-top mt-3 pt-3">
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
  );
};
FileInfoModalSidebar.propTypes = {
  asset: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    externalUrl: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    id: PropTypes.string.isRequired,
    portableUrl: PropTypes.string.isRequired,
    dateAdded: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    usageLocations: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  handleLockedAsset: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileInfoModalSidebar);
