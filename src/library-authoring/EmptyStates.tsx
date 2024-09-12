import React, { useContext, useCallback } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { ClearFiltersButton } from '../search-manager';
import messages from './messages';
import { LibraryContext } from './common/context';
import { useContentLibrary } from './data/apiHooks';

export const NoComponents = ({
  infoText = messages.noComponents,
  addBtnText = messages.addComponent,
}: {
  infoText: MessageDescriptor;
  addBtnText: MessageDescriptor;
}) => {
  const { openAddContentSidebar, openCreateCollectionModal } = useContext(LibraryContext);
  const { libraryId } = useParams();
  const { data: libraryData } = useContentLibrary(libraryId);
  const canEditLibrary = libraryData?.canEditLibrary ?? false;

  const handleOnClickButton = useCallback(() => {
    if (searchType === 'collection') {
      openCreateCollectionModal();
    } else {
      openAddContentSidebar();
    }
  }, [searchType]);

  return (
    <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
      <FormattedMessage {...infoText} />
      {canEditLibrary && (
        <Button iconBefore={Add} onClick={handleOnClickButton}>
          <FormattedMessage {...addBtnText} />
        </Button>
      )}
    </Stack>
  );
};

export const NoSearchResults = ({
  infoText = messages.noSearchResults,
}: {
  infoText: MessageDescriptor;
}) => (
  <Stack direction="horizontal" gap={3} className="my-6 justify-content-center">
    <FormattedMessage {...infoText} />
    <ClearFiltersButton variant="primary" size="md" />
  </Stack>
);
