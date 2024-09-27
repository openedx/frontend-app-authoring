import { FormattedMessage } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { ClearFiltersButton } from '../search-manager';
import messages from './messages';
import { useContentLibrary } from './data/apiHooks';
import { useLibraryContext } from './common/context';

export const NoComponents = ({
  infoText = messages.noComponents,
  addBtnText = messages.addComponent,
  handleBtnClick,
}: {
  infoText?: MessageDescriptor;
  addBtnText?: MessageDescriptor;
  handleBtnClick: () => void;
}) => {
  const { libraryId } = useLibraryContext();
  const { data: libraryData } = useContentLibrary(libraryId);
  const canEditLibrary = libraryData?.canEditLibrary ?? false;

  return (
    <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
      <FormattedMessage {...infoText} />
      {canEditLibrary && (
        <Button iconBefore={Add} onClick={handleBtnClick}>
          <FormattedMessage {...addBtnText} />
        </Button>
      )}
    </Stack>
  );
};

export const NoSearchResults = ({
  infoText = messages.noSearchResults,
}: {
  infoText?: MessageDescriptor;
}) => (
  <Stack direction="horizontal" gap={3} className="my-6 justify-content-center">
    <FormattedMessage {...infoText} />
    <ClearFiltersButton variant="primary" size="md" />
  </Stack>
);
