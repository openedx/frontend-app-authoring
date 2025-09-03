import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Container } from '@openedx/paragon';
import LibrariesV2List from '@src/studio-home/tabs-section/libraries-v2-tab';

import messages from './messages';

export const SelectDestinationView = ({
  destinationId,
  setDestinationId,
} : {
  destinationId?: string | null,
  setDestinationId: (libraryId: string) => void,
}) => {
  const intl = useIntl();

  return (
    <Container>
      <Alert variant="info">
        {intl.formatMessage(messages.selectDestinationAlert, { count: 1 })}
      </Alert>
      <LibrariesV2List
        selectedLibraryId={destinationId}
        handleSelect={setDestinationId}
      />
    </Container>
  );
};
