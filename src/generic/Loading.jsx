import React from 'react';
import { Spinner } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const Loading = () => (
  <div
    className="d-flex justify-content-center align-items-center flex-column"
    style={{
      height: '100vh',
    }}
  >
    <Spinner
      animation="border"
      role="status"
      variant="primary"
      screenReaderText={(
        <span className="sr-only">
          <FormattedMessage
            id="authoring.loading"
            defaultMessage="Loading..."
            description="Screen-reader message for when a page is loading."
          />
        </span>
      )}
    />
  </div>
);

export default Loading;
