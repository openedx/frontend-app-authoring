import React from 'react';
import { Spinner } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

export const LoadingSpinner = () => (
  <Spinner
    animation="border"
    role="status"
    variant="primary"
    screenReaderText={(
      <FormattedMessage
        id="authoring.loading"
        defaultMessage="Loading..."
        description="Screen-reader message for when a page is loading."
      />
    )}
  />
);

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center flex-column vh-100">
    <LoadingSpinner />
  </div>
);

export default Loading;
