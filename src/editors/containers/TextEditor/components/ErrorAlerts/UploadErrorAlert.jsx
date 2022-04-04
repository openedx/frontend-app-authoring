import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from '../SelectImageModal/messages';
import ErrorAlert from './ErrorAlert';
import { selectors } from '../../../../data/redux';
import { RequestKeys } from '../../../../data/constants/requests';

export const UploadErrorAlert = ({
  // redux
  isUploadError,
  // inject
}) => (
  <ErrorAlert
    isError={isUploadError}
  >
    <FormattedMessage
      {...messages.uploadImageError}
    />
  </ErrorAlert>
);

UploadErrorAlert.propTypes = {
  // redux
  isUploadError: PropTypes.bool.isRequired,
};
export const mapStateToProps = (state) => ({
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadImage }),
});
export const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(UploadErrorAlert);
