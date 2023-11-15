import React from 'react';
import { PropTypes } from 'prop-types';
import { Badge } from '@edx/paragon';

const StatusColumn = ({ row }) => {
  const { status } = row.original;
  const isUploaded = status === 'Success';

  if (isUploaded) {
    return null;
  }

  return (
    <Badge variant="light">
      {status}
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
