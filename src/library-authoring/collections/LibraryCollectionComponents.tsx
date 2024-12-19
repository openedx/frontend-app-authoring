import { Stack } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useSearchContext } from '../../search-manager';
import messages from './messages';
import { useSidebarContext } from '../common/context/SidebarContext';
import LibraryContent from '../LibraryContent';
import { ContentType } from '../routes';

const LibraryCollectionComponents = () => {
  const { totalHits: componentCount, isFiltered } = useSearchContext();
  const { openAddContentSidebar } = useSidebarContext();

  if (componentCount === 0) {
    return isFiltered
      ? <NoSearchResults infoText={messages.noSearchResultsInCollection} />
      : (
        <NoComponents
          infoText={messages.noComponentsInCollection}
          addBtnText={messages.addComponentsInCollection}
          handleBtnClick={openAddContentSidebar}
        />
      );
  }

  return (
    <Stack direction="vertical" gap={3}>
      <h3 className="text-gray">Content ({componentCount})</h3>
      <LibraryContent contentType={ContentType.collections} />
    </Stack>
  );
};

export default LibraryCollectionComponents;
