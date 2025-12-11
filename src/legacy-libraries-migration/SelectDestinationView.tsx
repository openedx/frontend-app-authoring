import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Container } from '@openedx/paragon';

import LibrariesV2List from '@src/studio-home/tabs-section/libraries-v2-tab';
import type { ContentLibrary } from '@src/library-authoring/data/api';

import messages from './messages';

interface SelectDestinationViewProps {
  destinationId?: string;
  setDestinationId: (library: ContentLibrary) => void;
  legacyLibCount: number;
}

export const SelectDestinationView = ({
  destinationId,
  setDestinationId,
  legacyLibCount,
}: SelectDestinationViewProps) => (
  <Container>
    <Alert variant="info">
      <FormattedMessage
        {...messages.selectDestinationAlert}
        values={{ count: legacyLibCount }}
      />
    </Alert>
    <LibrariesV2List
      selectedLibraryId={destinationId}
      handleSelect={setDestinationId}
      showCreateLibrary
    />
  </Container>
);
