import { useIntl } from "@edx/frontend-platform/i18n";
import { Button, useToggle } from "@openedx/paragon";
import { Add } from "@openedx/paragon/icons";
import { useCallback, useEffect, useState } from "react";
import DraggableList from "../../generic/DraggableList";
import { PickLibraryContentModal } from "../add-content";
import { useLibraryContext } from "../common/context/LibraryContext";
import { ContentType } from "../routes";
import messages from "./messages";

interface LibraryContainerChildrenProps {
  /** set to true if it is rendered as preview */
  readOnly?: boolean;
}

interface LibraryContainerMetadataWithUniqueId {
  originalId: string;
  id: string;
  displayName: string;
}

export const LibraryContainerChildren = ({ readOnly }: LibraryContainerChildrenProps) => {
  const intl = useIntl();
  // TODO: fix type
  const [orderedChildren, setOrderedChildren] = useState<LibraryContainerMetadataWithUniqueId[]>([]);
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const { sectionId, readOnly: libReadOnly, showOnlyPublished } = useLibraryContext();
  // TOOO: get data from server
  const children = [
    { id: "lct:UNIX:CS1:subsection:test-subsection-1-55890a", displayName: 'Test subsection 1' },
    { id: "lct:UNIX:CS1:subsection:test-subsection-2-adb711", displayName: 'Test subsection 2' },
  ];

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

  // if (isLoading) {
  //   return <Loading />;
  // }
  //
  // if (isError) {
  //   // istanbul ignore next
  //   return <ErrorAlert error={error} />;
  // }

  return (
    <div className="library-unit-page">
      <DraggableList
        itemList={orderedChildren}
        setState={setOrderedChildren}
        updateOrder={handleReorder}
      >
        {orderedChildren?.map((child, idx) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`${child.originalId}-${idx}`}
          >
            { child.displayName }
          </div>
        ))}
      </DraggableList>
      {!readOnly && (
        <div className="d-flex">
          <div className="w-100 mr-2">
            <Button
              className="ml-2"
              iconBefore={Add}
              variant="outline-primary rounded-0"
              disabled={readOnly}
              onClick={() => {}}
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
              extraFilter={['block_type = "subsection"']}
              visibleTabs={[ContentType.home]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
