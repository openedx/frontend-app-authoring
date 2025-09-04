import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';

import messages from './messages';

export const PublishedChip = () => (
  <Container
    className="p-2 text-nowrap flex-grow-1 status-button published-status font-weight-bold"
  >
    <FormattedMessage {...messages.publishedChipText} />
  </Container>
);
