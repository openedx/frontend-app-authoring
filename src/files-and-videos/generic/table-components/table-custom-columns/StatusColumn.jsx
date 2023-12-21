import React from 'react';
import { PropTypes } from 'prop-types';
import { Badge, OverlayTrigger, Tooltip } from '@edx/paragon';

const StatusColumn = ({ row }) => {
  const { status, errorDescription } = row.original;
  const isUploaded = status === 'Success';

  if (isUploaded) {
    return null;
  }

  return (
    // <OverlayTrigger
    //   key="status error tooltip"
    //   placement="left"
    //   overlay={status === 'failed' && (
    //     <Tooltip>
    //       {errorDescription}
    //     </Tooltip>
    //   )}
    // >
      <Badge variant="light">
        {status}
      </Badge>
    // </OverlayTrigger>
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
