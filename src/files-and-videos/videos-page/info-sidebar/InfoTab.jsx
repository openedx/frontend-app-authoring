import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';
import { injectIntl, FormattedDate, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getFileSizeToClosestByte } from '../../../utils';
import { getFormattedDuration } from '../data/utils';
import messages from './messages';

const InfoTab = ({ video }) => {
  const fileSize = getFileSizeToClosestByte(video?.fileSize);
  const duration = getFormattedDuration(video?.duration);

  return (
    <Stack className="mt-3">
      <div className="font-weight-bold">
        <FormattedMessage {...messages.dateAddedTitle} />
      </div>
      <FormattedDate
        value={video?.dateAdded}
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
      <div className="font-weight-bold mt-3">
        <FormattedMessage {...messages.videoLengthTitle} />
      </div>
      {duration}
    </Stack>
  );
};

InfoTab.propTypes = {
  video: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    dateAdded: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
  }),
};

InfoTab.defaultProps = {
  video: {},
};

export default injectIntl(InfoTab);
