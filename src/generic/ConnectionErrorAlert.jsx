import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import messages from '../messages';

const ConnectionErrorAlert = ({ intl }) => (
  <Alert variant="danger" data-testid="connectionErrorAlert">
    <FormattedMessage
      id="authoring.alert.error.connection"
      defaultMessage="We encountered a technical error when loading this page. This might be a temporary issue, so please try again in a few minutes. If the problem persists, please go to the {supportLink} for help."
      values={{
        supportLink: (
          <Alert.Link href={getConfig().SUPPORT_URL}>
            {intl.formatMessage(messages.supportText)}
          </Alert.Link>
        ),
      }}
    />
  </Alert>
);

ConnectionErrorAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ConnectionErrorAlert);
