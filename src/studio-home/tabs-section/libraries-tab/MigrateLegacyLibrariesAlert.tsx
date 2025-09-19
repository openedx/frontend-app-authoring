import { Alert, Button } from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from '../messages';

export const MigrateLegacyLibrariesAlert = () => (
  <Alert variant="warning" icon={Warning}>
    <Alert.Heading>
      <FormattedMessage {...messages.alertTitle} />
    </Alert.Heading>
    <div className="row">
      <div className="col-8">
        <FormattedMessage {...messages.alertDescriptionV1} />
      </div>
      <div className="col-4 d-flex justify-content-center align-items-start">
        <Button>
          <FormattedMessage {...messages.alertReviewButton} />
        </Button>
      </div>
    </div>
  </Alert>
);
