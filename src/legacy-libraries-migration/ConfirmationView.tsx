import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Card,
  Container,
  Icon,
  Stack,
} from '@openedx/paragon';
import {
  AccessTime,
  Folder,
  SubdirectoryArrowRight,
} from '@openedx/paragon/icons';

import type { ContentLibrary } from '@src/library-authoring/data/api';
import { LibraryV1Data } from '@src/studio-home/data/api';
import { BoldText } from '@src/utils';

import messages from './messages';

interface ConfirmationCardProps {
  legacyLib: LibraryV1Data;
  destinationName: string;
}

const ConfirmationCard = ({
  legacyLib,
  destinationName,
}: ConfirmationCardProps) => (
  <Card className="mb-3.5">
    <Card.Header
      title={(
        <Stack className="h4" direction="horizontal">
          <Icon className="mr-1" src={Folder} />
          <span>{legacyLib.displayName}</span>
        </Stack>
      )}
      subtitle={(
        <Stack className="mb-1.5" direction="horizontal">
          <Icon className="mr-1.5" src={SubdirectoryArrowRight} />
          <span>{destinationName}</span>
        </Stack>
      )}
    />
    {legacyLib.isMigrated && (
      <Stack className="ml-3.5 mt-1 mb-2 text-gray-500" direction="horizontal">
        <Icon className="mr-1.5" src={AccessTime} />
        <span className="x-small">
          <FormattedMessage
            {...messages.previouslyMigratedAlert}
            values={{
              libraryName: legacyLib.migratedToTitle,
              b: BoldText,
            }}
          />
        </span>
      </Stack>
    )}
  </Card>
);

interface ConfirmationViewProps {
  destination: ContentLibrary;
  legacyLibraries: LibraryV1Data[];
}

export const ConfirmationView = ({
  destination,
  legacyLibraries,
}: ConfirmationViewProps) => (
  <Container className="confirmation-view">
    <Alert variant="info">
      <FormattedMessage
        {...messages.confirmationViewAlert}
        values={{
          count: legacyLibraries.length,
          libraryName: destination.title,
          b: BoldText,
        }}
      />
    </Alert>
    {legacyLibraries.map((legacyLib) => (
      <ConfirmationCard
        key={legacyLib.libraryKey}
        legacyLib={legacyLib}
        destinationName={destination.title}
      />
    ))}
  </Container>
);
