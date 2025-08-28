import { Alert, Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

interface WelcomeLibrariesV2AlertProps {
  hasPendingMigrations: boolean;
}

const libraryDocsLink = (
  <Alert.Link href="https://docs.openedx.org/en/latest/educators/how-tos/course_development/create_new_library.html">
    <FormattedMessage {...messages.alertLibrariesDocLinkText} />
  </Alert.Link>
);

export const MigrateLegacyLibrariesAlert = ({ hasPendingMigrations }: WelcomeLibrariesV2AlertProps) => (
  <Alert variant="info">
    {hasPendingMigrations && (
      <Alert.Heading>
        <FormattedMessage {...messages.alertTitleMigrationPending} />
      </Alert.Heading>
    )}
    {hasPendingMigrations ? (
      <div className="row">
        <div className="col-8">
          <FormattedMessage {...messages.alertDescription} values={{ link: libraryDocsLink }} />
          <FormattedMessage {...messages.alertDescriptionMigrationPending} />
        </div>
        <div className="col-4 d-flex justify-content-center align-items-start">
          <Button>
            <FormattedMessage {...messages.alertReviewButton} />
          </Button>
        </div>
      </div>
    ) : (
      <FormattedMessage {...messages.alertDescription} />
    )}
  </Alert>
);
