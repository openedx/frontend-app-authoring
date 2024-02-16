import React from 'react';
import { PropTypes } from 'prop-types';
import { isNil } from 'lodash';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, Spinner } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';
import { RequestStatus } from '../../../../data/constants';

const ActiveColumn = ({ row, pageLoadStatus }) => {
  const { usageLocations } = row.original;
  if (isNil(usageLocations) || pageLoadStatus !== RequestStatus.SUCCESSFUL) {
    return (
      <Spinner
        animation="border"
        role="status"
        variant="primary"
        size="sm"
        screenReaderText={(
          <FormattedMessage
            id="authoring.loading"
            defaultMessage="Loading..."
            description="Screen-reader message for when a active column is loading."
          />
        )}
      />
    );
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
