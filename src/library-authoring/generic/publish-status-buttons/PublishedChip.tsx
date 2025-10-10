import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';

import messages from './messages';

/**
 * PublishedChip displays a styled label indicating that a component
 * or container is already published.
 *
 * It renders a localized message with consistent styling for status chips.
 */
export const PublishedChip = () => (
  <Container
    className="p-2 text-nowrap flex-grow-1 status-button published-status font-weight-bold"
  >
    <FormattedMessage {...messages.publishedChipText} />
  </Container>
);
