import { FormattedMessage } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { ClearFiltersButton } from '../search-manager';
import messages from './messages';
import { useLibraryContext } from './common/context/LibraryContext';

export const NoComponents = ({
  infoText = messages.noComponents,
  addBtnText = messages.addComponent,
  handleBtnClick,
}: {
  infoText?: MessageDescriptor;
  addBtnText?: MessageDescriptor;
  handleBtnClick: () => void;
}) => {
  const { readOnly } = useLibraryContext();

  return (
    <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
      <FormattedMessage {...infoText} />
      {!readOnly && (
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
