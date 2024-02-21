import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import messages from '../messages';

const SaveFormConnectionErrorAlert = ({ intl }) => (
  <Alert variant="danger" data-testid="connectionErrorAlert">
    <FormattedMessage
      id="authoring.alert.save.error.connection"
      defaultMessage="We encountered a technical error when applying changes. This might be a temporary issue, so please try again in a few minutes. If the problem persists, please go to the {supportLink} for help."
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

SaveFormConnectionErrorAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SaveFormConnectionErrorAlert);
