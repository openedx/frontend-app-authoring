import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import messages from './messages';

export const ErrorSummary = ({
  error,
}) => (
  <Alert
    icon={Info}
    show={!Object.values(error).every(val => Object.keys(val).length === 0)}
    variant="danger"
  >
    <Alert.Heading>
      <FormattedMessage {...messages.validateErrorTitle} />
    </Alert.Heading>
    <p>
      <FormattedMessage {...messages.validateErrorBody} />
    </p>
  </Alert>
);

ErrorSummary.defaultProps = {
  error: {
    duration: {},
    handout: {},
    license: {},
    thumbnail: {},
    transcripts: {},
    videoSource: {},
  },
};
ErrorSummary.propTypes = {
  error: PropTypes.node,
};

export default ErrorSummary;
