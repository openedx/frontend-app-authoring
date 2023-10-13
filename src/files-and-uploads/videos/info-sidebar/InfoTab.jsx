import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@edx/paragon';
import { injectIntl, FormattedDate } from '@edx/frontend-platform/i18n';
import { getFileSizeToClosestByte } from '../../data/utils';
import { getFormattedDuration } from '../data/utils';

const InfoTab = ({ video }) => {
  const fileSize = getFileSizeToClosestByte(video?.fileSize);
  const duration = getFormattedDuration(video?.duration);

  return (
    <Stack className="mt-3">
      <div className="font-weight-bold">
        Date Added
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
        File size
      </div>
      {fileSize}
      <div className="font-weight-bold mt-3">
        Video length
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
