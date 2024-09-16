import React, { useContext, useCallback } from 'react';
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

type NoSearchResultsProps = {
  searchType?: 'collection' | 'component',
};

export const NoComponents = ({ searchType = 'component' }: NoSearchResultsProps) => {
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
      {searchType === 'collection'
        ? <FormattedMessage {...messages.noCollections} />
        : <FormattedMessage {...messages.noComponents} />}
      {canEditLibrary && (
        <Button iconBefore={Add} onClick={handleOnClickButton}>
          {searchType === 'collection'
            ? <FormattedMessage {...messages.addCollection} />
            : <FormattedMessage {...messages.addComponent} />}
        </Button>
      )}
    </Stack>
  );
};

export const NoSearchResults = ({ searchType = 'component' }: NoSearchResultsProps) => (
  <Stack direction="horizontal" gap={3} className="my-6 justify-content-center">
    {searchType === 'collection'
      ? <FormattedMessage {...messages.noSearchResultsCollections} />
      : <FormattedMessage {...messages.noSearchResults} />}
    <ClearFiltersButton variant="primary" size="md" />
  </Stack>
);
