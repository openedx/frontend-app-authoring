import React, { useContext } from 'react';
import { Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../generic/Loading';
import { useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './collections/LibraryCollections';
import { LibraryComponents } from './components';
import LibrarySection from './components/LibrarySection';
import LibraryRecentlyModified from './LibraryRecentlyModified';
import messages from './messages';
import { LibraryContext } from './common/context';

type LibraryHomeProps = {
  libraryId: string,
  tabList: { home: string, components: string, collections: string },
  handleTabChange: (key: string) => void,
};

const LibraryHome = ({ libraryId, tabList, handleTabChange } : LibraryHomeProps) => {
  const intl = useIntl();
  const {
    totalHits: componentCount,
    totalCollectionHits: collectionCount,
    isLoading,
    isFiltered,
  } = useSearchContext();
  const { openAddContentSidebar } = useContext(LibraryContext);

  const renderEmptyState = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (componentCount === 0 && collectionCount === 0) {
      return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
    }
    return null;
  };

  return (
    <Stack gap={3}>
      <LibraryRecentlyModified libraryId={libraryId} />
      {
        renderEmptyState()
        || (
          <>
            <LibrarySection
              title={intl.formatMessage(messages.collectionsTitle, { collectionCount })}
              contentCount={collectionCount}
              viewAllAction={() => handleTabChange(tabList.collections)}
            >
              <LibraryCollections variant="preview" />
            </LibrarySection>
            <LibrarySection
              title={intl.formatMessage(messages.componentsTitle, { componentCount })}
              contentCount={componentCount}
              viewAllAction={() => handleTabChange(tabList.components)}
            >
              <LibraryComponents libraryId={libraryId} variant="preview" />
            </LibrarySection>
          </>
        )
      }
    </Stack>
  );
};

export default LibraryHome;
