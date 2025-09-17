import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Container } from '@openedx/paragon';
import LibrariesV2List from '@src/studio-home/tabs-section/libraries-v2-tab';
import type { ContentLibrary } from '@src/library-authoring/data/api';

import messages from './messages';

interface SelectDestinationViewProps {
  destinationId: string | undefined;
  setDestinationId: (library: ContentLibrary) => void;
  legacyLibCount: number;
}

export const SelectDestinationView = ({
  destinationId,
  setDestinationId,
  legacyLibCount,
}: SelectDestinationViewProps) => {
  const intl = useIntl();

  return (
    <Container>
      <Alert variant="info">
        {intl.formatMessage(messages.selectDestinationAlert, { count: legacyLibCount })}
      </Alert>
      <LibrariesV2List
        selectedLibraryId={destinationId}
        handleSelect={setDestinationId}
        showCreateLibrary
      />
    </Container>
  );
};
