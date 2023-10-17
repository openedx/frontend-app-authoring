import React from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

const ActiveColumn = ({ row }) => {
  const { usageLocations } = row.original;
  const numOfUsageLocations = usageLocations.length;
  return numOfUsageLocations > 0 ? <Icon src={Check} /> : null;
};

ActiveColumn.propTypes = {
  row: {
    original: {
      usageLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    }.isRequired,
  }.isRequired,
};

export default ActiveColumn;
