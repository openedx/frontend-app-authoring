import React, { useContext } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { ClearFiltersButton } from '../search-manager';
import messages from './messages';
import { LibraryContext } from './common/context';
import { useContentLibrary } from './data/apiHooks';

export const NoComponents = () => {
  const { openAddContentSidebar } = useContext(LibraryContext);
  const { libraryId } = useParams();
  const { data: libraryData } = useContentLibrary(libraryId);
  const canEditLibrary = libraryData?.canEditLibrary ?? false;

  return (
    <Stack direction="horizontal" gap={3} className="mt-6 just  ify-content-center">
      <FormattedMessage {...messages.noComponents} />
      {canEditLibrary && (
        <Button iconBefore={Add} onClick={() => openAddContentSidebar()}>
          <FormattedMessage {...messages.addComponent} />
        </Button>
      )}
    </Stack>
  );
};

export const NoSearchResults = () => (
  <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
    <FormattedMessage {...messages.noSearchResults} />
    <ClearFiltersButton variant="primary" size="md" />
  </Stack>
);
