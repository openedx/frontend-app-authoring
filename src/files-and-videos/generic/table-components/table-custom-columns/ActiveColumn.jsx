import React from 'react';
import { PropTypes } from 'prop-types';
import { isArray } from 'lodash';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, Spinner } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

const ActiveColumn = ({ row }) => {
  const { usageLocations } = row.original;
  if (isArray(usageLocations)) {
    const numOfUsageLocations = usageLocations?.length;
    return numOfUsageLocations > 0 ? <Icon src={Check} /> : null;
  }
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
          description="Screen-reader message for when a page is loading."
        />
      )}
    />
  );
};

ActiveColumn.propTypes = {
  row: {
    original: {
      usageLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    }.isRequired,
  }.isRequired,
};

export default injectIntl(ActiveColumn);
