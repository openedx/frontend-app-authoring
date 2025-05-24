import { FormattedMessage } from "@edx/frontend-platform/i18n";
import { useCallback, useEffect, useState } from "react";
import DraggableList from "../../generic/DraggableList";
import Loading from "../../generic/Loading";
import ErrorAlert from '../../generic/alert-error';
import { useLibraryContext } from "../common/context/LibraryContext";
import { useContainerChildren } from "../data/apiHooks";
import messages from "./messages";
import { Container } from "../data/api";
import { Stack } from "@openedx/paragon";

interface LibraryContainerChildrenProps {
  /** set to true if it is rendered as preview */
  readOnly?: boolean;
}

interface LibraryContainerMetadataWithUniqueId extends Container {
  originalId: string;
}

interface SubsectionRowProps {
  subsection: LibraryContainerMetadataWithUniqueId;
}

const SubsectionRow = ({ subsection }: SubsectionRowProps) => {
  return (
    <Stack
      direction="horizontal"
      className="font-weight-bold p-3 bg-light-200 mb-2 border-left border-light-500 rounded-lg"
    >
      { subsection.displayName }
    </Stack>
  )
}

export const LibraryContainerChildren = ({ readOnly }: LibraryContainerChildrenProps) => {
  // TODO: fix type
  const [orderedChildren, setOrderedChildren] = useState<LibraryContainerMetadataWithUniqueId[]>([]);
  const { sectionId, showOnlyPublished } = useLibraryContext();
  const handleReorder = useCallback(() => async (newOrder?: LibraryContainerMetadataWithUniqueId[]) => {
    if (!newOrder) {
      return;
    }
    // const usageKeys = newOrder.map((o) => o.originalId);
    // try {
    //   await orderMutator.mutateAsync(usageKeys);
    //   showToast(intl.formatMessage(messages.orderUpdatedMsg));
    // } catch (e) {
    //   showToast(intl.formatMessage(messages.failedOrderUpdatedMsg));
    // }
  }, []);

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
      >
        {orderedChildren?.map((child, idx) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <SubsectionRow
            // eslint-disable-next-line react/no-array-index-key
            key={`${child.originalId}-${idx}`}
            subsection={child}
          />
        ))}
      </DraggableList>
    </div>
  );
}
