import React from 'react';
import { Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { NoComponents, NoSearchResults } from './EmptyStates';
import { useSearchContext } from '../search-manager';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './components/LibraryComponents';
import LibrarySection from './components/LibrarySection';
import LibraryRecentlyModified from './LibraryRecentlyModified';
import messages from './messages';

type LibraryHomeProps = {
  libraryId: string,
  tabList: { home: string, components: string, collections: string },
  handleTabChange: (key: string) => void,
};

const LibraryHome = ({ libraryId, tabList, handleTabChange } : LibraryHomeProps) => {
  const intl = useIntl();
  const {
    totalHits: componentCount,
    searchKeywords,
  } = useSearchContext();

  const collectionCount = 0;

  const renderEmptyState = () => {
    if (componentCount === 0) {
      return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
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
              title={intl.formatMessage(messages.collectionsSectionTitle, { collectionCount })}
              contentCount={collectionCount}
              // TODO: add viewAllAction here once collections implemented
            >
              <LibraryCollections />
            </LibrarySection>
            <LibrarySection
              title={intl.formatMessage(messages.componentsSectionTitle, { componentCount })}
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
