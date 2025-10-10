import { Alert, Button, Hyperlink } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';

import { useLibrariesV1Data } from '@src/studio-home/data/apiHooks';

import messages from '../messages';

const libraryDocsLink = (
  <Hyperlink
    target="_blank"
    showLaunchIcon={false}
    destination="https://docs.openedx.org/en/latest/educators/how-tos/course_development/create_new_library.html"
  >
    <FormattedMessage {...messages.alertLibrariesDocLinkText} />
  </Hyperlink>
);

export const WelcomeLibrariesV2Alert = () => {
  const { data, isPending, isError } = useLibrariesV1Data();
  const navigate = useNavigate();

  // Does not show the alert if we are still loading or if there was an error fetching libraries
  if (isPending || isError) {
    return null;
  }

  const hasPendingV1Migrations = data.libraries.some(library => !library.isMigrated);
  return (
    <Alert variant="info">
      {hasPendingV1Migrations ? (
        <>
          <Alert.Heading>
            <FormattedMessage {...messages.alertTitle} />
          </Alert.Heading>
          <div className="row">
            <div className="col-8">
              <FormattedMessage {...messages.alertDescriptionV2} values={{ link: libraryDocsLink }} />
              <FormattedMessage {...messages.alertDescriptionV2MigrationPending} />
            </div>
            <div className="col-4 d-flex justify-content-center align-items-start">
              <Button onClick={() => navigate('../libraries-v1/migrate')}>
                <FormattedMessage {...messages.alertReviewButton} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <FormattedMessage {...messages.alertDescriptionV2} values={{ link: libraryDocsLink }} />
      )}
    </Alert>
  );
};
