import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import ErrorAlert from './ErrorAlert';
import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

export const UploadErrorAlert = ({
  message,
  // redux
  isUploadError,
  // inject
}) => (
  <ErrorAlert
    isError={isUploadError}
  >
    <FormattedMessage
      {...message}
    />
  </ErrorAlert>
);

UploadErrorAlert.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  // redux
  isUploadError: PropTypes.bool.isRequired,
};
export const mapStateToProps = (state) => ({
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadImage }),
});
export const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(UploadErrorAlert);
