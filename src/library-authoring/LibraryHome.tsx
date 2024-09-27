import { Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './collections/LibraryCollections';
import { LibraryComponents } from './components';
import LibrarySection from './components/LibrarySection';
import LibraryRecentlyModified from './LibraryRecentlyModified';
import messages from './messages';
import { useLibraryContext } from './common/context';

type LibraryHomeProps = {
  tabList: { home: string, components: string, collections: string },
  handleTabChange: (key: string) => void,
};

const LibraryHome = ({ tabList, handleTabChange } : LibraryHomeProps) => {
  const intl = useIntl();
  const {
    totalHits: componentCount,
    totalCollectionHits: collectionCount,
    isFiltered,
  } = useSearchContext();
  const { openAddContentSidebar } = useLibraryContext();

  const renderEmptyState = () => {
    if (componentCount === 0 && collectionCount === 0) {
      return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
    }
    return null;
  };

  return (
    <Stack gap={3}>
      <LibraryRecentlyModified />
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
              <LibraryComponents variant="preview" />
            </LibrarySection>
          </>
        )
      }
    </Stack>
  );
};

export default LibraryHome;
