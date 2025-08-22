import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';

import messages from './messages';

export const PublishedChip = () => {
  const intl = useIntl();

  return (
    <Container
      className="p-2 text-nowrap flex-grow-1 status-button published-status font-weight-bold"
    >
      {intl.formatMessage(messages.publishedChipText)}
    </Container>
  );
};
