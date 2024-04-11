import React from 'react';
import { PropTypes } from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';
import { VIDEO_FAILURE_STATUSES } from '../../../videos-page/data/constants';
import messages from '../../messages';

const StatusColumn = ({ row }) => {
  const { status } = row.original;
  const isUploaded = status === 'Success';
  const isFailed = VIDEO_FAILURE_STATUSES.includes(status);
  const intl = useIntl();
  const failedText = intl.formatMessage(messages.failedLabel);

  if (isUploaded) {
    return null;
  }

  return (
    <Badge variant="light">
      {isFailed ? failedText : status}
    </Badge>
  );
};

StatusColumn.propTypes = {
  row: {
    original: {
      status: PropTypes.string.isRequired,
    }.isRequired,
  }.isRequired,
};

export default StatusColumn;
