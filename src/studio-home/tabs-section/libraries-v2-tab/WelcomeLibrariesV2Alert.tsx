import { Alert, Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useLibrariesV1Data } from '@src/studio-home/data/apiHooks';

import messages from '../messages';

const libraryDocsLink = (
  <Alert.Link href="https://docs.openedx.org/en/latest/educators/how-tos/course_development/create_new_library.html">
    <FormattedMessage {...messages.alertLibrariesDocLinkText} />
  </Alert.Link>
);

export const MigrateLegacyLibrariesAlert = () => {
  const { data, isLoading, isError } = useLibrariesV1Data();

  // Does not show the alert if we are still loading or if there was an error fetching libraries
  if (isLoading || isError) {
    return null;
  }

  const hasPendingV1Migrations = data.libraries.some(library => !library.isMigrated);
  return (
    <Alert variant="info">
      {hasPendingV1Migrations && (
        <Alert.Heading>
          <FormattedMessage {...messages.alertTitle} />
        </Alert.Heading>
      )}
      {hasPendingV1Migrations ? (
        <div className="row">
          <div className="col-8">
            <FormattedMessage {...messages.alertDescriptionV2} values={{ link: libraryDocsLink }} />
            <FormattedMessage {...messages.alertDescriptionV2MigrationPending} />
          </div>
          <div className="col-4 d-flex justify-content-center align-items-start">
            <Button>
              <FormattedMessage {...messages.alertReviewButton} />
            </Button>
          </div>
        </div>
      ) : (
        <FormattedMessage {...messages.alertDescriptionV2} values={{ link: libraryDocsLink }} />
      )}
    </Alert>
  );
};
