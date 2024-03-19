import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import FormikControl from 'CourseAuthoring/generic/FormikControl';

import messages from './messages';
import { providerNames } from './constants';
import LiveCommonFields from './LiveCommonFields';

const ZoomSettings = ({
  intl,
  values,
}) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>
    {!values.piiSharingEnable ? (
      <p data-testid="request-pii-sharing">
        {intl.formatMessage(messages.requestPiiSharingEnable, { provider: providerNames[values.provider] })}
      </p>
    ) : (
      <>
        {(values.piiSharingEmail || values.piiSharingUsername)
          && (
            <p data-testid="helper-text">
              {intl.formatMessage(messages.providerHelperText, { providerName: providerNames[values.provider] })}
            </p>
          )}
        <LiveCommonFields values={values} />
        <FormikControl
          name="launchEmail"
          value={values.launchEmail}
          floatingLabel={intl.formatMessage(messages.launchEmail)}
          type="input"
        />
      </>
    )}
  </>
);

ZoomSettings.propTypes = {
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    consumerKey: PropTypes.string,
    consumerSecret: PropTypes.string,
    launchUrl: PropTypes.string,
    launchEmail: PropTypes.string,
    provider: PropTypes.string,
    piiSharingEmail: PropTypes.bool,
    piiSharingUsername: PropTypes.bool,
    piiSharingEnable: PropTypes.bool,
  }).isRequired,
};

export default injectIntl(ZoomSettings);
