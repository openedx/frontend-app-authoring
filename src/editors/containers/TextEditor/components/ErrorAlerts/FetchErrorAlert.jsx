import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from '../SelectImageModal/messages';
import ErrorAlert from './ErrorAlert';
import { selectors } from '../../../../data/redux';
import { RequestKeys } from '../../../../data/constants/requests';

export const FetchErrorAlert = ({
  // redux
  isFetchError,
  // inject
}) => (
  <ErrorAlert
    isError={isFetchError}
  >
    <FormattedMessage
      {...messages.fetchImagesError}
    />
  </ErrorAlert>
);

FetchErrorAlert.propTypes = {
  // redux
  isFetchError: PropTypes.bool.isRequired,
};
export const mapStateToProps = (state) => ({
  isFetchError: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchImages }),
});
export const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(FetchErrorAlert);
