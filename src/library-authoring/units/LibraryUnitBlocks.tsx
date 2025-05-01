import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Badge, Button, Icon, IconButton, Stack, useToggle,
} from '@openedx/paragon';
import { Add, Description, DragIndicator } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { ContentTagsDrawerSheet } from '../../content-tags-drawer';
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
  libraryAuthoringQueryKeys,
  useContainerChildren,
  useUpdateContainerChildren,
  useUpdateXBlockFields,
} from '../data/apiHooks';
import { LibraryBlock } from '../LibraryBlock';
import { useLibraryRoutes, ContentType } from '../routes';
import messages from './messages';
import { useSidebarContext } from '../common/context/SidebarContext';
import { ToastContext } from '../../generic/toast-context';
import { canEditComponent } from '../components/ComponentEditorModal';

/** Components that need large min height in preview */
const LARGE_COMPONENTS = [
  COMPONENT_TYPES.advanced,
  COMPONENT_TYPES.dragAndDrop,
  COMPONENT_TYPES.discussion,
  'lti',
  'lti_consumer',
];

interface BlockHeaderProps {
  block: LibraryBlockMetadata;
  onTagClick: () => void;
}

/** Component header, split out to reuse in drag overlay */
const BlockHeader = ({ block, onTagClick }: BlockHeaderProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);

  const updateMutation = useUpdateXBlockFields(block.id);

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

  return (
    <>
      <Stack direction="horizontal" gap={2} className="font-weight-bold">
        <Icon src={getItemIcon(block.blockType)} />
        <InplaceTextEditor
          onSave={handleSaveDisplayName}
          text={block.displayName}
        />
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
        <TagCount size="sm" count={block.tagsCount} onClick={onTagClick} />
        <ComponentMenu usageKey={block.id} />
      </Stack>
    </>
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
  const [orderedBlocks, setOrderedBlocks] = useState<LibraryBlockMetadata[]>([]);
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();

  const [hidePreviewFor, setHidePreviewFor] = useState<string | null>(null);
  const { navigateTo } = useLibraryRoutes();
  const { showToast } = useContext(ToastContext);

  const {
    unitId,
    showOnlyPublished,
    componentId,
    readOnly,
    setComponentId,
    openComponentEditor,
  } = useLibraryContext();

  const {
    openAddContentSidebar,
  } = useSidebarContext();

  const queryClient = useQueryClient();
  const orderMutator = useUpdateContainerChildren(unitId);
  const {
    data: blocks,
    isLoading,
    isError,
    error,
  } = useContainerChildren(unitId);

  useEffect(() => setOrderedBlocks(blocks || []), [blocks]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  const handleReorder = () => async (newOrder: LibraryBlockMetadata[]) => {
    const usageKeys = newOrder.map((o) => o.id);
    try {
      await orderMutator.mutateAsync(usageKeys);
      showToast(intl.formatMessage(messages.orderUpdatedMsg));
    } catch (e) {
      showToast(intl.formatMessage(messages.failedOrderUpdatedMsg));
    }
  };

  const onTagSidebarClose = () => {
    queryClient.invalidateQueries(libraryAuthoringQueryKeys.containerChildren(unitId!));
    closeManageTagsDrawer();
  };

  const handleComponentSelection = (block: LibraryBlockMetadata, numberOfClicks: number) => {
    setComponentId(block.id);
    navigateTo({ componentId: block.id });
    const canEdit = canEditComponent(block.id);
    if (numberOfClicks > 1 && canEdit) {
      // Open editor on double click.
      openComponentEditor(block.id);
    }
  };

  /* istanbul ignore next */
  const calculateMinHeight = (block: LibraryBlockMetadata) => {
    if (LARGE_COMPONENTS.includes(block.blockType)) {
      return '700px';
    }
    return '200px';
  };

  const renderOverlay = (activeId: string | null) => {
    if (!activeId) {
      return null;
    }
    const block = orderedBlocks?.find((val) => val.id === activeId);
    if (!block) {
      return null;
    }
    return (
      <ActionRow className="bg-light-200 border border-light-500 p-2 rounded">
        <BlockHeader block={block} onTagClick={openManageTagsDrawer} />
        <IconButton
          src={DragIndicator}
          variant="light"
          iconAs={Icon}
          alt=""
        />
      </ActionRow>
    );
  };

  const renderedBlocks = orderedBlocks?.map((block, idx) => (
    // A container can have multiple instances of the same block
    // eslint-disable-next-line react/no-array-index-key
    <IframeProvider key={`${block.id}-${idx}-${block.modified}`}>
      <SortableItem
        id={block.id}
        componentStyle={null}
        actions={<BlockHeader block={block} onTagClick={openManageTagsDrawer} />}
        actionStyle={{
          borderRadius: '8px 8px 0px 0px',
          padding: '0.5rem 1rem',
          background: '#FBFAF9',
          borderBottom: 'solid 1px #E1DDDB',
          outline: hidePreviewFor === block.id && '2px dashed gray',
        }}
        isClickable
        onClick={(e: { detail: number; }) => handleComponentSelection(block, e.detail)}
        disabled={preview}
      >
        {hidePreviewFor !== block.id && (
          <div className={classNames('p-3', {
            'container-mw-md': block.blockType === blockTypes.video,
          })}
          >
            <LibraryBlock
              usageKey={block.id}
              version={showOnlyPublished ? 'published' : undefined}
              minHeight={calculateMinHeight(block)}
            />
          </div>
        )}
      </SortableItem>
    </IframeProvider>
  ));

  return (
    <div className="library-unit-page">
      <DraggableList
        itemList={orderedBlocks}
        setState={setOrderedBlocks}
        updateOrder={handleReorder}
        renderOverlay={renderOverlay}
        activeId={hidePreviewFor}
        setActiveId={setHidePreviewFor}
      >
        {renderedBlocks}
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
      <ContentTagsDrawerSheet
        id={componentId}
        onClose={onTagSidebarClose}
        showSheet={isManageTagsDrawerOpen}
      />
    </div>
  );
};
