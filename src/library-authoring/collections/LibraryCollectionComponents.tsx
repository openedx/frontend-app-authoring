import { useContext } from 'react';
import { Stack } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useSearchContext } from '../../search-manager';
import { LibraryComponents } from '../components';
import messages from './messages';
import { LibraryContext } from '../common/context';

const LibraryCollectionComponents = ({ libraryId }: { libraryId: string }) => {
  const { totalHits: componentCount, isFiltered } = useSearchContext();
  const { openAddContentSidebar } = useContext(LibraryContext);

  if (componentCount === 0) {
    return isFiltered ?
      <NoSearchResults infoText={messages.noSearchResultsInCollection} />
      : <NoComponents
        infoText={messages.noComponentsInCollection}
        addBtnText={messages.addComponentsInCollection}
        handleBtnClick={openAddContentSidebar}
      />;
  }

  return (
    <Stack direction="vertical" gap={3}>
      <h3 className="text-gray">Content ({componentCount})</h3>
      <LibraryComponents libraryId={libraryId} variant="full" />
    </Stack>
  );
};

export default LibraryCollectionComponents;
