import React from 'react';
import { PropTypes } from 'prop-types';
import { isNil } from 'lodash';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';
import { RequestStatus } from '../../../../data/constants';
import { LoadingSpinner } from '../../../../generic/Loading';

const ActiveColumn = ({ row, pageLoadStatus }) => {
  const { usageLocations } = row.original;
  if (isNil(usageLocations) || pageLoadStatus !== RequestStatus.SUCCESSFUL) {
    return <LoadingSpinner size="sm" />;
  }
  const numOfUsageLocations = usageLocations.length;
  return numOfUsageLocations > 0 ? <Icon src={Check} /> : null;
};

ActiveColumn.propTypes = {
  row: {
    original: {
      usageLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    }.isRequired,
  }.isRequired,
  pageLoadStatus: PropTypes.string.isRequired,
};

export default injectIntl(ActiveColumn);
