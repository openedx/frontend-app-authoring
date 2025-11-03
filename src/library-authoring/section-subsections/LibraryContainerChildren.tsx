import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  ActionRow, Badge, Icon, Stack,
} from '@openedx/paragon';
import { Description } from '@openedx/paragon/icons';
import { InplaceTextEditor } from '@src/generic/inplace-text-editor';
import DraggableList, { SortableItem } from '../../generic/DraggableList';
import Loading from '../../generic/Loading';
import ErrorAlert from '../../generic/alert-error';
import { ContainerType, getBlockType } from '../../generic/key-utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  useContainerChildren,
  useUpdateContainer,
  useUpdateContainerChildren,
} from '../data/apiHooks';
import { messages, subsectionMessages, sectionMessages } from './messages';
import containerMessages from '../containers/messages';
import { Container } from '../data/api';
import { ToastContext } from '../../generic/toast-context';
import TagCount from '../../generic/tag-count';
import { useLibraryRoutes } from '../routes';
import { SidebarActions, SidebarBodyItemId, useSidebarContext } from '../common/context/SidebarContext';
import { skipIfUnwantedTarget, useRunOnNextRender } from '../../utils';
import { ContainerMenu } from '../containers/ContainerCard';

interface LibraryContainerChildrenProps {
  containerKey: string;
  /** set to true if it is rendered as preview */
  readOnly?: boolean;
}

interface LibraryContainerMetadataWithUniqueId extends Container {
  originalId: string;
}

interface ContainerRowProps extends LibraryContainerChildrenProps {
  container: LibraryContainerMetadataWithUniqueId;
  index?: number;
}

const ContainerRow = ({
  containerKey, container, readOnly, index,
}: ContainerRowProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const updateMutation = useUpdateContainer(container.originalId, containerKey);
  const { showOnlyPublished } = useLibraryContext();
  const { setSidebarAction, openItemSidebar } = useSidebarContext();

  const handleSaveDisplayName = async (newDisplayName: string) => {
    try {
      await updateMutation.mutateAsync({
        displayName: newDisplayName,
      });
      showToast(intl.formatMessage(containerMessages.updateContainerSuccessMsg));
    } catch (err) {
      showToast(intl.formatMessage(containerMessages.updateContainerErrorMsg));
    }
  };

  /* istanbul ignore next */
  const scheduleJumpToTags = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows manage tags section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageTags), 250);
  });

  const jumpToManageTags = useCallback(() => {
    openItemSidebar(container.originalId, SidebarBodyItemId.ContainerInfo);
    scheduleJumpToTags();
  }, [openItemSidebar, scheduleJumpToTags, container.originalId]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        // Prevent parent card from being clicked.
        className="stop-event-propagation"
      >
        <InplaceTextEditor
          onSave={handleSaveDisplayName}
          text={showOnlyPublished ? (container.publishedDisplayName ?? container.displayName) : container.displayName}
          textClassName="font-weight-bold small"
          readOnly={readOnly || showOnlyPublished}
        />
      </div>
      <ActionRow.Spacer />
      <Stack
        direction="horizontal"
        gap={3}
        // Prevent parent card from being clicked.
        className="stop-event-propagation"
      >
        {!showOnlyPublished && container.hasUnpublishedChanges && (
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
        <TagCount
          size="sm"
          count={container.tagsCount}
          onClick={readOnly ? undefined : jumpToManageTags}
        />
        {!readOnly && (
          <ContainerMenu
            containerKey={container.originalId}
            displayName={container.displayName}
            index={index}
          />
        )}
      </Stack>
    </>
  );
};

/** Component to display container children subsections for section and units for subsection */
export const LibraryContainerChildren = ({ containerKey, readOnly }: LibraryContainerChildrenProps) => {
  const intl = useIntl();
  const [orderedChildren, setOrderedChildren] = useState<LibraryContainerMetadataWithUniqueId[]>([]);
  const { showOnlyPublished, readOnly: libReadOnly } = useLibraryContext();
  const { navigateTo } = useLibraryRoutes();
  const { sidebarItemInfo, openItemSidebar } = useSidebarContext();
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const orderMutator = useUpdateContainerChildren(containerKey);
  const { showToast } = useContext(ToastContext);
  const containerType = getBlockType(containerKey);
  const handleReorder = useCallback(() => async (newOrder?: LibraryContainerMetadataWithUniqueId[]) => {
    if (!newOrder) {
      return;
    }
    const childrenKeys = newOrder.map((o) => o.originalId);
    try {
      await orderMutator.mutateAsync(childrenKeys);
      showToast(intl.formatMessage(messages.orderUpdatedMsg));
    } catch (e) {
      showToast(intl.formatMessage(messages.failedOrderUpdatedMsg));
    }
  }, [orderMutator]);

  const {
    data: children,
    isLoading,
    isError,
    error,
  } = useContainerChildren<Container>(containerKey, showOnlyPublished);

  useEffect(() => {
    // Create new ids which are unique using index.
    // This is required to support multiple components with same id under a container.
    const newChildren = children?.map((child, idx) => {
      const newChild: LibraryContainerMetadataWithUniqueId = {
        ...child,
        id: `${child.id}----${idx}`,
        originalId: child.id,
      };
      return newChild;
    });
    return setOrderedChildren(newChildren || []);
  }, [children, setOrderedChildren]);

  const handleChildClick = useCallback((
    child: LibraryContainerMetadataWithUniqueId,
    numberOfClicks: number,
    index: number,
  ) => {
    if (readOnly) {
      // don't allow interaction if rendered as preview
      return;
    }
    const doubleClicked = numberOfClicks > 1;
    if (!doubleClicked) {
      openItemSidebar(child.originalId, SidebarBodyItemId.ContainerInfo, index);
    } else {
      navigateTo({ containerId: child.originalId });
    }
  }, [openItemSidebar, navigateTo, readOnly]);

  const getComponentStyle = useCallback((childId: string) => {
    const style: { marginBottom: string, borderRadius: string, outline?: string } = {
      marginBottom: '1rem',
      borderRadius: '8px',
    };
    if (activeDraggingId === childId) {
      style.outline = '2px dashed gray';
    }
    return style;
  }, [activeDraggingId]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="ml-2 library-container-children">
      {children?.length === 0 && (
        <h4 className="ml-2">
          {containerType === ContainerType.Section ? (
            <FormattedMessage {...sectionMessages.noChildrenText} />
          ) : (
            <FormattedMessage {...subsectionMessages.noChildrenText} />
          )}
        </h4>
      )}
      <DraggableList
        itemList={orderedChildren}
        setState={setOrderedChildren}
        updateOrder={handleReorder}
        activeId={activeDraggingId}
        setActiveId={setActiveDraggingId}
      >
        {orderedChildren?.map((child, index) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <SortableItem
            id={child.id}
            key={child.id}
            componentStyle={getComponentStyle(child.id)}
            actionStyle={{
              padding: '0.5rem 1rem',
              background: '#FBFAF9',
              borderRadius: '8px',
              borderLeft: '8px solid #E1DDDB',
            }}
            isClickable={!readOnly}
            onClick={(e) => skipIfUnwantedTarget(e, (event) => handleChildClick(child, event.detail, index))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleChildClick(child, 1, index);
              }
            }}
            disabled={readOnly || libReadOnly}
            cardClassName={sidebarItemInfo?.id === child.originalId && sidebarItemInfo?.index === index ? 'selected' : undefined}
            actions={(
              <ContainerRow
                containerKey={containerKey}
                container={child}
                readOnly={readOnly || libReadOnly}
                index={index}
              />
            )}
          />

        ))}
      </DraggableList>
    </div>
  );
};
