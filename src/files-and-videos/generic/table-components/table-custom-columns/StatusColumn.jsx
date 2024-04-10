import React from 'react';
import { PropTypes } from 'prop-types';
import { Badge } from '@openedx/paragon';
import { VIDEO_FAILURE_STATUSES } from '../../../videos-page/data/constants';

const StatusColumn = ({ row }) => {
  const { status } = row.original;
  const isUploaded = status === 'Success';
  const isFailed = VIDEO_FAILURE_STATUSES.includes(status);

  if (isUploaded) {
    return null;
  }

  return (
    <Badge variant="light">
      {isFailed ? 'Failed' : status}
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
