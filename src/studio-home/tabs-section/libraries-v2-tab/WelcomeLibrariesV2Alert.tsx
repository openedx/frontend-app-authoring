import { Alert, Hyperlink } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getExternalLinkUrl } from '@edx/frontend-platform';

import messages from '../messages';

const libraryDocsLink = (
  <Hyperlink
    target="_blank"
    showLaunchIcon={false}
    destination={getExternalLinkUrl(
      'https://docs.openedx.org/en/latest/educators/how-tos/course_development/create_new_library.html',
    )}
  >
    <FormattedMessage {...messages.alertLibrariesDocLinkText} />
  </Hyperlink>
);

export const WelcomeLibrariesV2Alert = () => (
  <Alert variant="info">
    <FormattedMessage {...messages.alertDescriptionV2} values={{ link: libraryDocsLink }} />
  </Alert>
);
