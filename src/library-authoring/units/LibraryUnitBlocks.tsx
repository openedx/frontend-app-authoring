import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Badge, Button, Icon, Stack, useToggle,
} from '@openedx/paragon';
import { Add, Description } from '@openedx/paragon/icons';
import classNames from 'classnames';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { blockTypes } from '../../editors/data/constants/app';
import DraggableList, { SortableItem } from '../../generic/DraggableList';

import ErrorAlert from '../../generic/alert-error';
import { getItemIcon } from '../../generic/block-type-utils';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';
import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import Loading from '../../generic/Loading';
import TagCount from '../../generic/tag-count';
import { useLibraryContext } from '../common/context/LibraryContext';
import { PickLibraryContentModal } from '../add-content';
import ComponentMenu from '../components';
import { LibraryBlockMetadata } from '../data/api';
import {
  useContainerChildren,
  useUpdateContainerChildren,
  useUpdateXBlockFields,
} from '../data/apiHooks';
import { LibraryBlock } from '../LibraryBlock';
import { useLibraryRoutes, ContentType } from '../routes';
import messages from './messages';
import { SidebarActions, SidebarBodyComponentId, useSidebarContext } from '../common/context/SidebarContext';
import { ToastContext } from '../../generic/toast-context';
import { canEditComponent } from '../components/ComponentEditorModal';
import { useRunOnNextRender } from '../../utils';

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
  block: LibraryBlockMetadataWithUniqueId;
  preview?: boolean;
  isDragging?: boolean;
}

/** Component header */
const BlockHeader = ({ block }: ComponentBlockProps) => {
  const intl = useIntl();
  const { showOnlyPublished } = useLibraryContext();
  const { showToast } = useContext(ToastContext);
  const { navigateTo } = useLibraryRoutes();
  const { openComponentInfoSidebar, setSidebarAction } = useSidebarContext();

  const updateMutation = useUpdateXBlockFields(block.originalId);

  const handleSaveDisplayName = (newDisplayName: string) => {
    updateMutation.mutateAsync({
      metadata: {
        display_name: newDisplayName,
      },
    }).then(() => {
      showToast(intl.formatMessage(messages.updateComponentSuccessMsg));
    }).catch(() => {
      showToast(intl.formatMessage(messages.updateComponentErrorMsg));
    });
  };

  /* istanbul ignore next */
  const scheduleJumpToTags = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows manage tags section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageTags), 250);
  });

  /* istanbul ignore next */
  const jumpToManageTags = () => {
    navigateTo({ componentId: block.originalId });
    openComponentInfoSidebar(block.originalId);
    scheduleJumpToTags();
  };

  return (
    <>
      <Stack
        direction="horizontal"
        gap={2}
        className="font-weight-bold"
        // Prevent parent card from being clicked.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        onClick={(e) => e.stopPropagation()}
      >
        <Icon src={getItemIcon(block.blockType)} />
        <InplaceTextEditor
          onSave={handleSaveDisplayName}
          text={showOnlyPublished ? (block.publishedDisplayName ?? block.displayName) : block.displayName}
        />
      </Stack>
      <ActionRow.Spacer />
      <Stack
        direction="horizontal"
        gap={3}
        // Prevent parent card from being clicked.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        onClick={(e) => e.stopPropagation()}
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
        <TagCount size="sm" count={block.tagsCount} onClick={jumpToManageTags} />
        <ComponentMenu usageKey={block.originalId} />
      </Stack>
    </>
  );
};

/** ComponentBlock to render preview of given component under Unit */
const ComponentBlock = ({ block, preview, isDragging }: ComponentBlockProps) => {
  const { showOnlyPublished } = useLibraryContext();
  const { navigateTo } = useLibraryRoutes();

  const {
    unitId, collectionId, componentId, openComponentEditor,
  } = useLibraryContext();

  const { openInfoSidebar, sidebarComponentInfo } = useSidebarContext();

  const handleComponentSelection = useCallback((numberOfClicks: number) => {
    navigateTo({ componentId: block.originalId });
    const canEdit = canEditComponent(block.originalId);
    if (numberOfClicks > 1 && canEdit) {
      // Open editor on double click.
      openComponentEditor(block.originalId);
    } else {
      // open current component sidebar
      openInfoSidebar(block.originalId, collectionId, unitId);
    }
  }, [block, collectionId, unitId, navigateTo, canEditComponent, openComponentEditor, openInfoSidebar]);

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
    } if (componentId === block.originalId) {
      return {
        outline: '2px solid black',
      };
    }
    return {};
  }, [isDragging, componentId, block]);

  const selected = sidebarComponentInfo?.type === SidebarBodyComponentId.ComponentInfo
    && sidebarComponentInfo?.id === block.id;

  return (
    <IframeProvider>
      <SortableItem
        id={block.id}
        componentStyle={getComponentStyle()}
        actions={<BlockHeader block={block} />}
        actionStyle={{
          borderRadius: '8px 8px 0px 0px',
          padding: '0.5rem 1rem',
          background: '#FBFAF9',
          borderBottom: 'solid 1px #E1DDDB',
        }}
        isClickable
        onClick={(e: { detail: number; }) => handleComponentSelection(e.detail)}
        disabled={preview}
        cardClassName={selected ? 'selected' : undefined}
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
            scrollIntoView={block.isNew}
          />
        </div>
      </SortableItem>
    </IframeProvider>
  );
};

interface LibraryUnitBlocksProps {
  /** set to true if it is rendered as preview
  * This disables drag and drop
  */
  preview?: boolean;
}

export const LibraryUnitBlocks = ({ preview }: LibraryUnitBlocksProps) => {
  const intl = useIntl();
  const [orderedBlocks, setOrderedBlocks] = useState<LibraryBlockMetadataWithUniqueId[]>([]);
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();

  const [hidePreviewFor, setHidePreviewFor] = useState<string | null>(null);
  const { showToast } = useContext(ToastContext);

  const { readOnly, showOnlyPublished } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();
  const unitId = sidebarComponentInfo?.id;

  const { openAddContentSidebar } = useSidebarContext();

  const orderMutator = useUpdateContainerChildren(unitId);
  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren(unitId, showOnlyPublished);

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
      <DraggableList
        itemList={orderedBlocks}
        setState={setOrderedBlocks}
        updateOrder={handleReorder}
        activeId={hidePreviewFor}
        setActiveId={setHidePreviewFor}
      >
        {orderedBlocks?.map((block, idx) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <ComponentBlock
            // eslint-disable-next-line react/no-array-index-key
            key={`${block.originalId}-${idx}-${block.modified}`}
            block={block}
            isDragging={hidePreviewFor === block.id}
          />
        ))}
      </DraggableList>
      {!preview && (
        <div className="d-flex">
          <div className="w-100 mr-2">
            <Button
              className="ml-2"
              iconBefore={Add}
              variant="outline-primary rounded-0"
              disabled={readOnly}
              onClick={openAddContentSidebar}
              block
            >
              {intl.formatMessage(messages.newContentButton)}
            </Button>
          </div>
          <div className="w-100 ml-2">
            <Button
              className="ml-2"
              iconBefore={Add}
              variant="outline-primary rounded-0"
              disabled={readOnly}
              onClick={showAddLibraryContentModal}
              block
            >
              {intl.formatMessage(messages.addExistingContentButton)}
            </Button>
            <PickLibraryContentModal
              isOpen={isAddLibraryContentModalOpen}
              onClose={closeAddLibraryContentModal}
              extraFilter={['NOT block_type = "unit"', 'NOT type = "collection"']}
              visibleTabs={[ContentType.components]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
