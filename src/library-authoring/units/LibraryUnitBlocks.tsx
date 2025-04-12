import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Badge, Icon, Stack, useToggle,
} from '@openedx/paragon';
import { Description } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ContentTagsDrawerSheet } from '../../content-tags-drawer';
import { blockTypes } from '../../editors/data/constants/app';
import DraggableList, { SortableItem } from '../../editors/sharedComponents/DraggableList';

import ErrorAlert from '../../generic/alert-error';
import { getItemIcon } from '../../generic/block-type-utils';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';
import Loading from '../../generic/Loading';
import TagCount from '../../generic/tag-count';
import { useLibraryContext } from '../common/context/LibraryContext';
import ComponentMenu from '../components';
import { LibraryBlockMetadata } from '../data/api';
import { libraryAuthoringQueryKeys, useContainerChildren } from '../data/apiHooks';
import { LibraryBlock } from '../LibraryBlock';
import { useLibraryRoutes } from '../routes';
import messages from './messages';

export const LibraryUnitBlocks = () => {
  const [orderedBlocks, setOrderedBlocks] = useState<LibraryBlockMetadata[]>([]);
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);
  const { navigateTo } = useLibraryRoutes();

  const {
    libraryId,
    unitId,
    showOnlyPublished,
    componentId,
    setComponentId,
  } = useLibraryContext();

  const queryClient = useQueryClient();
  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren(libraryId, unitId);

  useEffect(() => setOrderedBlocks(blocks || []), [blocks]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  /* istanbul ignore next */
  const handleReorder = () => (newOrder: LibraryBlockMetadata[]) => {
    // eslint-disable-next-line no-console
    console.log('LibraryUnitBlocks newOrder: ', newOrder);
    // TODO: update order of components in unit
  };

  const onTagSidebarClose = () => {
    queryClient.invalidateQueries(libraryAuthoringQueryKeys.containerChildren(libraryId, unitId));
    closeManageTagsDrawer();
  };

  const handleComponentSelection = (block: LibraryBlockMetadata) => {
    setComponentId(block.id);
    navigateTo({ componentId: block.id });
  };

  const renderedBlocks = orderedBlocks?.map((block) => (
    <IframeProvider key={block.id}>
      <SortableItem
        id={block.id}
        componentStyle={null}
        actions={(
          <>
            <Stack direction="horizontal" gap={2} className="font-weight-bold">
              <Icon src={getItemIcon(block.blockType)} />
              {block.displayName}
            </Stack>
            <ActionRow.Spacer />
            <Stack direction="horizontal" gap={3}>
              {block.hasUnpublishedChanges && (
                <Badge
                  className="px-2 pt-1"
                  variant="warning"
                >
                  <Stack direction="horizontal" gap={1}>
                    <Icon className="mb-1" size="xs" src={Description} />
                    <FormattedMessage {...messages.draftChipText} />
                  </Stack>
                </Badge>
              )}
              <TagCount size="sm" count={block.tagsCount} onClick={openManageTagsDrawer} />
              <ComponentMenu usageKey={block.id} />
            </Stack>
          </>
        )}
        actionStyle={{
          borderRadius: '8px 8px 0px 0px',
          padding: '0.5rem 1rem',
          background: '#FBFAF9',
          borderBottom: 'solid 1px #E1DDDB',
        }}
        isClickable
        onClick={() => handleComponentSelection(block)}
      >
        <div className={classNames('p-3', {
          'container-mw-md': block.blockType === blockTypes.video,
        })}
        >
          <LibraryBlock
            usageKey={block.id}
            version={showOnlyPublished ? 'published' : undefined}
          />
        </div>
      </SortableItem>
    </IframeProvider>
  ));

  return (
    <div className="library-unit-page">
      <DraggableList itemList={orderedBlocks} setState={setOrderedBlocks} updateOrder={handleReorder}>
        {renderedBlocks}
      </DraggableList>
      <ContentTagsDrawerSheet
        id={componentId}
        onClose={onTagSidebarClose}
        showSheet={isManageTagsDrawerOpen}
      />
    </div>
  );
};
