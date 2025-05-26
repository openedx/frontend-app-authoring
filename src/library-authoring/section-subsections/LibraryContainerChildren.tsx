import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";
import { useCallback, useContext, useEffect, useState } from "react";
import DraggableList, { SortableItem } from "../../generic/DraggableList";
import Loading from "../../generic/Loading";
import ErrorAlert from '../../generic/alert-error';
import { useLibraryContext } from "../common/context/LibraryContext";
import {
  libraryAuthoringQueryKeys,
  useContainerChildren,
  useUpdateContainer,
  useUpdateContainerChildren,
} from "../data/apiHooks";
import messages from "./messages";
import containerMessages from "../containers/messages";
import { Container } from "../data/api";
import { ActionRow, Stack } from "@openedx/paragon";
import { InplaceTextEditor } from "../../generic/inplace-text-editor";
import { ToastContext } from "../../generic/toast-context";
import TagCount from "../../generic/tag-count";
import { ContainerMenu } from "../components/ContainerCard";
import { useLibraryRoutes } from "../routes";
import { useQueryClient } from "@tanstack/react-query";

interface LibraryContainerChildrenProps {
  /** set to true if it is rendered as preview */
  readOnly?: boolean;
}

interface LibraryContainerMetadataWithUniqueId extends Container {
  originalId: string;
}

interface SubsectionRowProps extends LibraryContainerChildrenProps {
  subsection: LibraryContainerMetadataWithUniqueId;
}

const SubsectionRow = ({ subsection, readOnly }: SubsectionRowProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const { sectionId } = useLibraryContext();
  const updateMutation = useUpdateContainer(subsection.originalId);
  const queryClient = useQueryClient();

  if (!sectionId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without sectionId URL parameter');
  }

  const handleSaveDisplayName = async (newDisplayName: string) => {
    try {
      await updateMutation.mutateAsync({
          displayName: newDisplayName,
      });
      showToast(intl.formatMessage(containerMessages.updateContainerSuccessMsg));
      // invalidate parent container children query to see upated name
      queryClient.invalidateQueries({
        queryKey: libraryAuthoringQueryKeys.containerChildren(sectionId),
      });
    } catch (err) {
      showToast(intl.formatMessage(containerMessages.updateContainerErrorMsg));
      throw err;
    }
  };

  return (
    <>
      <InplaceTextEditor
        onSave={handleSaveDisplayName}
        text={subsection.displayName}
        textClassName='font-weight-bold small'
        readOnly={readOnly}
      />
      <ActionRow.Spacer/>
      <Stack
        direction="horizontal"
        gap={3}
        // Prevent parent card from being clicked.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        onClick={(e) => e.stopPropagation()}
      >
        <TagCount size="sm" count={subsection.tagsCount} />
        <ContainerMenu
          containerKey={subsection.originalId}
          containerType={subsection.containerType}
          displayName={subsection.displayName}
        />
      </Stack>
    </>
  )
}

export const LibraryContainerChildren = ({ readOnly }: LibraryContainerChildrenProps) => {
  const intl = useIntl();
  const [orderedChildren, setOrderedChildren] = useState<LibraryContainerMetadataWithUniqueId[]>([]);
  const { sectionId, showOnlyPublished } = useLibraryContext();
  const { navigateTo } = useLibraryRoutes();
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const orderMutator = useUpdateContainerChildren(sectionId);
  const { showToast } = useContext(ToastContext);
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
  } = useContainerChildren(sectionId, showOnlyPublished);

  useEffect(() => {
    // Create new ids which are unique using index.
    // This is required to support multiple components with same id under a unit.
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

  if (!sectionId) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Rendered without sectionId URL parameter');
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="ml-2 mb-3">
      {children?.length === 0 && (
        <h4 className="ml-2">
          <FormattedMessage {...messages.sectionNoChildrenText} />
        </h4>
      )}
      <DraggableList
        itemList={orderedChildren}
        setState={setOrderedChildren}
        updateOrder={handleReorder}
        activeId={activeDraggingId}
        setActiveId={setActiveDraggingId}
      >
        {orderedChildren?.map((child, idx) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <SortableItem
            id={child.id}
            key={child.id}
            componentStyle={{
              outline: activeDraggingId === child.id && '2px dashed gray',
              marginBottom: '1rem',
              borderRadius: '8px',
            }}
            children={null}
            actionStyle={{
              padding: '0.5rem 1rem',
              background: '#FBFAF9',
              borderRadius: '8px',
              borderLeft: '8px solid #E1DDDB',
            }}
            isClickable
            onClick={(e: { detail: number; }) => navigateTo({
              subsectionId: child.originalId,
              doubleClicked: e.detail > 1,
            })}
            disabled={readOnly}
            actions={
              <SubsectionRow
                subsection={child}
                readOnly={readOnly}
              />
            }
          />

        ))}
      </DraggableList>
    </div>
  );
}
