import { Stack } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useSearchContext } from '../../search-manager';
import { LibraryComponents } from '../components';
import messages from './messages';
import { useLibraryContext } from '../common/context';

const LibraryCollectionComponents = () => {
  const { totalHits: componentCount, isFiltered } = useSearchContext();
  const { openAddContentSidebar } = useLibraryContext();

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
      <LibraryComponents />
    </Stack>
  );
};

export default LibraryCollectionComponents;
