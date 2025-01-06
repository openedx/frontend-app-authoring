import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import messages from '../messages';

const ConnectionErrorAlert = ({ intl }) => (
  <Alert variant="danger" data-testid="connectionErrorAlert">
    <FormattedMessage
      {...messages.connectionError}
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
