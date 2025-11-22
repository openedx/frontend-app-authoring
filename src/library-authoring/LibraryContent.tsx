import { useEffect } from 'react';
import { LoadingSpinner } from '../generic/Loading';
import { useGetContentHits, useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import { useLibraryContext } from './common/context/LibraryContext';
import { useSidebarContext } from './common/context/SidebarContext';
import CollectionCard from './components/CollectionCard';
import ComponentCard from './components/ComponentCard';
import { ContentType } from './routes';
import { useLoadOnScroll } from '../hooks';
import messages from './collections/messages';
import ContainerCard from './containers/ContainerCard';
import { useMigrationBlocksInfo } from './data/apiHooks';

/**
 * Library Content to show content grid
 *
 * Use content to:
 *   - 'collections': Suggest to create a collection on empty state.
*   - Anything else to suggest to add content on empty state.
 */

type LibraryContentProps = {
  contentType?: ContentType;
};

const LibraryItemCard = {
  collection: CollectionCard,
  library_block: ComponentCard,
  library_container: ContainerCard,
};

const LibraryContent = ({ contentType = ContentType.home }: LibraryContentProps) => {
  const {
    hits,
    totalHits,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isPending,
    isFiltered,
    usageKey,
  } = useSearchContext();
  const { libraryId, openCreateCollectionModal } = useLibraryContext();
  const { openAddContentSidebar, openComponentInfoSidebar } = useSidebarContext();
  const { data: placeholderBlocks } = useMigrationBlocksInfo(libraryId, true);
  // Fetch unsupported blocks usage_key information from meilisearch index.
  const { data: placeholderData } = useGetContentHits(
    [
      `usage_key IN [${placeholderBlocks?.map((block) => `"${block.sourceKey}"`).join(',')}]`,
    ],
    (placeholderBlocks?.length || 0) > 0,
    ['usage_key', 'block_type', 'display_name'],
    placeholderBlocks?.length,
    true,
  );
  // __AUTO_GENERATED_PRINT_VAR_START__
  console.log("LibraryContent placeholderData: ", placeholderData); // __AUTO_GENERATED_PRINT_VAR_END__


  useEffect(() => {
    if (usageKey) {
      openComponentInfoSidebar(usageKey);
    }
  }, [usageKey]);

  useLoadOnScroll(
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    true,
  );

  if (isPending) {
    return <LoadingSpinner />;
  }
  if (totalHits === 0) {
    if (contentType === ContentType.collections) {
      return isFiltered
        ? <NoSearchResults infoText={messages.noSearchResultsCollections} />
        : (
          <NoComponents
            infoText={messages.noCollections}
            addBtnText={messages.addCollection}
            handleBtnClick={openCreateCollectionModal}
          />
        );
    }
    return isFiltered ? <NoSearchResults /> : <NoComponents handleBtnClick={openAddContentSidebar} />;
  }

  return (
    <div className="library-cards-grid">
      {hits.map((contentHit) => {
        const CardComponent = LibraryItemCard[contentHit.type] || ComponentCard;

        return <CardComponent key={contentHit.id} hit={contentHit} />;
      })}
    </div>
  );
};

export default LibraryContent;
