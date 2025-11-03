import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Badge, Icon, Stack,
} from '@openedx/paragon';
import { Description } from '@openedx/paragon/icons';
import classNames from 'classnames';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { blockTypes } from '@src/editors/data/constants/app';
import DraggableList, { SortableItem } from '@src/generic/DraggableList';

import ErrorAlert from '@src/generic/alert-error';
import { getItemIcon } from '@src/generic/block-type-utils';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { InplaceTextEditor } from '@src/generic/inplace-text-editor';
import Loading from '@src/generic/Loading';
import TagCount from '@src/generic/tag-count';
import { ToastContext } from '@src/generic/toast-context';
import { skipIfUnwantedTarget, useRunOnNextRender } from '@src/utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import ComponentMenu from '../components';
import { LibraryBlockMetadata } from '../data/api';
import {
  useContainerChildren,
  useUpdateContainerChildren,
  useUpdateXBlockFields,
} from '../data/apiHooks';
import { LibraryBlock } from '../LibraryBlock';
import messages from './messages';
import { SidebarActions, SidebarBodyItemId, useSidebarContext } from '../common/context/SidebarContext';
import { canEditComponent } from '../components/ComponentEditorModal';

/** Components that need large min height in preview */
const LARGE_COMPONENTS = [
  COMPONENT_TYPES.advanced,
  COMPONENT_TYPES.dragAndDrop,
  COMPONENT_TYPES.discussion,
  'lti',
  'lti_consumer',
];

interface LibraryBlockMetadataWithUniqueId extends LibraryBlockMetadata {
  originalId: string;
}

interface ComponentBlockProps {
  index: number;
  block: LibraryBlockMetadataWithUniqueId;
  readOnly?: boolean;
  isDragging?: boolean;
}

/** Component header */
const BlockHeader = ({ block, index, readOnly }: ComponentBlockProps) => {
  const intl = useIntl();
  const { showOnlyPublished } = useLibraryContext();
  const { showToast } = useContext(ToastContext);
  const { setSidebarAction, openItemSidebar } = useSidebarContext();

  const updateMutation = useUpdateXBlockFields(block.originalId);

  const handleSaveDisplayName = async (newDisplayName: string) => {
    try {
      await updateMutation.mutateAsync({
        metadata: {
          display_name: newDisplayName,
        },
      });
      showToast(intl.formatMessage(messages.updateComponentSuccessMsg));
    } catch (err) {
      showToast(intl.formatMessage(messages.updateComponentErrorMsg));
    }
  };

  /* istanbul ignore next */
  const scheduleJumpToTags = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows manage tags section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageTags), 250);
  });

  /* istanbul ignore next */
  const jumpToManageTags = () => {
    openItemSidebar(block.originalId, SidebarBodyItemId.ComponentInfo);
    scheduleJumpToTags();
  };

  return (
    <>
      <Stack
        direction="horizontal"
        gap={2}
        className="font-weight-bold stop-event-propagation"
      >
        <Icon src={getItemIcon(block.blockType)} />
        <InplaceTextEditor
          onSave={handleSaveDisplayName}
          text={showOnlyPublished ? (block.publishedDisplayName ?? block.displayName) : block.displayName}
          readOnly={readOnly || showOnlyPublished}
        />
      </Stack>
      <ActionRow.Spacer />
      <Stack
        direction="horizontal"
        gap={3}
        className="stop-event-propagation"
      >
        {!showOnlyPublished && block.hasUnpublishedChanges && (
          <Badge
            className="px-2 py-1"
            variant="warning"
          >
            <Stack direction="horizontal" gap={1}>
              <Icon size="xs" src={Description} />
              <FormattedMessage {...messages.draftChipText} />
            </Stack>
          </Badge>
        )}
        <TagCount size="sm" count={block.tagsCount} onClick={readOnly ? undefined : jumpToManageTags} />
        {!readOnly && <ComponentMenu index={index} usageKey={block.originalId} />}
      </Stack>
    </>
  );
};

/** ComponentBlock to render preview of given component under Unit */
const ComponentBlock = ({
  block, readOnly, isDragging, index,
}: ComponentBlockProps) => {
  const { showOnlyPublished, openComponentEditor } = useLibraryContext();

  const { sidebarItemInfo, openItemSidebar } = useSidebarContext();

  const handleComponentSelection = useCallback((numberOfClicks: number) => {
    if (readOnly) {
      // don't allow interaction if rendered as preview
      return;
    }
    openItemSidebar(
      block.originalId,
      SidebarBodyItemId.ComponentInfo,
      index,
    );
    const canEdit = canEditComponent(block.originalId);
    if (numberOfClicks > 1 && canEdit) {
      // Open editor on double click.
      openComponentEditor(block.originalId);
    }
  }, [block, openItemSidebar, canEditComponent, openComponentEditor, readOnly]);

  useEffect(() => {
    if (block.isNew) {
      handleComponentSelection(1);
    }
  }, [block]);

  /* istanbul ignore next */
  const calculateMinHeight = () => {
    if (LARGE_COMPONENTS.includes(block.blockType)) {
      return '700px';
    }
    return '200px';
  };

  const getComponentStyle = useCallback(() => {
    if (isDragging) {
      return {
        outline: '2px dashed gray',
        maxHeight: '200px',
        overflowY: 'hidden',
      };
    }
    return {};
  }, [isDragging, block]);

  return (
    <IframeProvider>
      <SortableItem
        id={block.id}
        componentStyle={getComponentStyle()}
        actions={<BlockHeader block={block} index={index} readOnly={readOnly} />}
        actionStyle={{
          borderRadius: '8px 8px 0px 0px',
          padding: '0.5rem 1rem',
          background: '#FBFAF9',
          borderBottom: 'solid 1px #E1DDDB',
        }}
        isClickable={!readOnly}
        onClick={(e) => skipIfUnwantedTarget(e, (event) => handleComponentSelection(event.detail))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleComponentSelection(e.detail);
          }
        }}
        disabled={readOnly}
        cardClassName={sidebarItemInfo?.id === block.originalId && sidebarItemInfo?.index === index ? 'selected' : undefined}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={classNames('p-3', {
            'container-mw-md': block.blockType === blockTypes.video,
          })}
          // Prevent parent card from being clicked.
          onClick={(e) => e.stopPropagation()}
        >
          <LibraryBlock
            usageKey={block.originalId}
            version={showOnlyPublished ? 'published' : undefined}
            minHeight={calculateMinHeight()}
            scrollIntoView={!readOnly && block.isNew}
          />
        </div>
      </SortableItem>
    </IframeProvider>
  );
};

interface LibraryUnitBlocksProps {
  unitId: string;
  /** set to true if it is rendered as preview
  * This disables drag and drop, title edit and menus
  */
  readOnly?: boolean;
}

export const LibraryUnitBlocks = ({ unitId, readOnly: componentReadOnly }: LibraryUnitBlocksProps) => {
  const intl = useIntl();
  const [orderedBlocks, setOrderedBlocks] = useState<LibraryBlockMetadataWithUniqueId[]>([]);

  const [hidePreviewFor, setHidePreviewFor] = useState<string | null>(null);
  const { showToast } = useContext(ToastContext);

  const { readOnly: libraryReadOnly, showOnlyPublished } = useLibraryContext();

  const readOnly = componentReadOnly || libraryReadOnly;

  const orderMutator = useUpdateContainerChildren(unitId);
  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren<LibraryBlockMetadata>(unitId, showOnlyPublished);

  const handleReorder = useCallback(() => async (newOrder?: LibraryBlockMetadataWithUniqueId[]) => {
    if (!newOrder) {
      return;
    }
    const usageKeys = newOrder.map((o) => o.originalId);
    try {
      await orderMutator.mutateAsync(usageKeys);
      showToast(intl.formatMessage(messages.orderUpdatedMsg));
    } catch (e) {
      showToast(intl.formatMessage(messages.failedOrderUpdatedMsg));
    }
  }, [orderMutator]);

  useEffect(() => {
    // Create new ids which are unique using index.
    // This is required to support multiple components with same id under a unit.
    const newBlocks = blocks?.map((block, idx) => {
      const newBlock: LibraryBlockMetadataWithUniqueId = {
        ...block,
        id: `${block.id}----${idx}`,
        originalId: block.id,
      };
      return newBlock;
    });
    return setOrderedBlocks(newBlocks || []);
  }, [blocks, setOrderedBlocks]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="library-unit-page">
      {orderedBlocks?.length === 0 && (
        <h4 className="ml-2">
          <FormattedMessage {...messages.noChildrenText} />
        </h4>
      )}
      <DraggableList
        itemList={orderedBlocks}
        setState={setOrderedBlocks}
        updateOrder={handleReorder}
        activeId={hidePreviewFor}
        setActiveId={setHidePreviewFor}
      >
        {orderedBlocks?.map((block, idx) => (
          // A container can have multiple instances of the same block
          <ComponentBlock
            // eslint-disable-next-line react/no-array-index-key
            key={`${block.originalId}-${idx}-${block.modified}`}
            block={block}
            index={idx}
            isDragging={hidePreviewFor === block.id}
            readOnly={readOnly}
          />
        ))}
      </DraggableList>
    </div>
  );
};
