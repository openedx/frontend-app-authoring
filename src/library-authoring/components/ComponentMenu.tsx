import { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { useClipboard } from '@src/generic/clipboard';
import { getBlockType } from '@src/generic/key-utils';
import { ToastContext } from '@src/generic/toast-context';

import { useOptionalLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import {
  SidebarActions,
  SidebarBodyItemId,
  useSidebarContext,
} from '@src/library-authoring/common/context/SidebarContext';
import {
  useContainerChildren,
  useRemoveItemsFromCollection,
  useUpdateContainerChildren,
} from '@src/library-authoring/data/apiHooks';
import containerMessages from '@src/library-authoring/containers/messages';
import unitMessages from '@src/library-authoring/units/messages';
import outlineCardMessages from '@src/course-outline/card-header/messages';
import { useLibraryRoutes } from '@src/library-authoring/routes';
import { canEditComponent } from './ComponentEditorModal';
import ComponentDeleter from './ComponentDeleter';
import ComponentRemover from './ComponentRemover';
import messages from './messages';
import { LibraryBlockMetadata } from '../data/api';

interface Props {
  usageKey: string;
  index?: number;
}

export const ComponentMenu = ({ usageKey, index }: Props) => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    containerId,
    openComponentEditor,
    readOnly,
  } = useOptionalLibraryContext();

  const {
    sidebarItemInfo,
    closeLibrarySidebar,
    openItemSidebar,
  } = useSidebarContext();
  const { insideCollection, navigateTo } = useLibraryRoutes();

  const canEdit = usageKey && canEditComponent(usageKey);
  const { showToast } = useContext(ToastContext);
  const removeCollectionComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isRemoveModalOpen, openRemoveModal, closeRemoveModal] = useToggle(false);
  const { copyToClipboard } = useClipboard();

  const updateClipboardClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    copyToClipboard(usageKey);
  };

  const removeFromCollection = () => {
    removeCollectionComponentsMutation.mutateAsync([usageKey]).then(() => {
      if (sidebarItemInfo?.id === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(intl.formatMessage(containerMessages.removeComponentFromCollectionSuccess));
    }).catch(() => {
      showToast(intl.formatMessage(containerMessages.removeComponentFromCollectionFailure));
    });
  };

  const handleEdit = useCallback(() => {
    openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo);
    openComponentEditor?.(usageKey);
  }, [usageKey, openItemSidebar, openComponentEditor]);

  const showManageCollections = useCallback(() => {
    navigateTo({ selectedItemId: usageKey, sidebarAction: SidebarActions.JumpToManageCollections });
  }, [
    usageKey,
    navigateTo,
  ]);

  const containerType = containerId ? getBlockType(containerId) : 'collection';

  // The following provide information about the parent container so we can implement "Move Up" and "Move Down" menu
  // actions, if relevant.
  const orderMutator = useUpdateContainerChildren(containerId);
  const { data: parentContainerComponents } = useContainerChildren<LibraryBlockMetadata>(containerId);
  // If we're in a [draft/editable] container, these handlers will move the current component up and down:
  const moveInParent = useCallback(async (delta: number) => {
    if (!parentContainerComponents || index === undefined) {
      return;
    }
    const newOrder = parentContainerComponents.map(c => c.id);
    const [idToMove] = newOrder.splice(index, 1); // Remove from its current position
    newOrder.splice(index + delta, 0, idToMove); // Insert into new position
    try {
      await orderMutator.mutateAsync(newOrder); // Save the new order
      if (sidebarItemInfo?.id === usageKey) {
        openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo, index + delta);
      }
    } catch {
      showToast(intl.formatMessage(unitMessages.failedOrderUpdatedMsg));
    }
  }, [index, orderMutator, parentContainerComponents, sidebarItemInfo, usageKey, openItemSidebar]);
  const moveUp = useCallback(() => moveInParent(-1), [moveInParent]);
  const moveDown = useCallback(() => moveInParent(1), [moveInParent]);

  return (
    <Dropdown id="component-card-dropdown">
      <Dropdown.Toggle
        id="component-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        size="sm"
        variant="primary"
        alt={intl.formatMessage(messages.componentCardMenuAlt)}
        data-testid="component-card-menu-toggle"
      />
      <Dropdown.Menu>
        {!readOnly && (
          <Dropdown.Item {...(canEdit ? { onClick: handleEdit } : { disabled: true })}>
            <FormattedMessage {...messages.menuEdit} />
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={updateClipboardClick}>
          <FormattedMessage {...messages.menuCopyToClipboard} />
        </Dropdown.Item>
        {insideCollection && !readOnly && (
          <Dropdown.Item onClick={removeFromCollection}>
            <FormattedMessage
              {...containerMessages.menuRemoveFromContainer}
              values={{
                containerType,
              }}
            />
          </Dropdown.Item>
        )}
        {!readOnly && (
          <Dropdown.Item onClick={showManageCollections}>
            <FormattedMessage {...containerMessages.menuAddToCollection} />
          </Dropdown.Item>
        )}

        {!readOnly && parentContainerComponents && index !== undefined && (
          <Dropdown.Item onClick={moveUp} disabled={index === 0}>
            <FormattedMessage {...outlineCardMessages.menuMoveUp} />
          </Dropdown.Item>
        )}
        {!readOnly && parentContainerComponents && index !== undefined && (
          <Dropdown.Item onClick={moveDown} disabled={index >= parentContainerComponents.length - 1}>
            <FormattedMessage {...outlineCardMessages.menuMoveDown} />
          </Dropdown.Item>
        )}

        {(containerId || !readOnly) && <Dropdown.Divider />}

        {containerId && (
          <Dropdown.Item onClick={openRemoveModal}>
            <FormattedMessage {...messages.removeComponentFromUnitMenu} />
          </Dropdown.Item>
        )}
        {!readOnly && (
          <Dropdown.Item onClick={openDeleteModal}>
            <FormattedMessage {...messages.menuDelete} />
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
      {isDeleteModalOpen && /* istanbul ignore next */ (
        <ComponentDeleter
          usageKey={usageKey}
          close={closeDeleteModal}
        />
      )}
      {isRemoveModalOpen && (
        <ComponentRemover
          usageKey={usageKey}
          index={index}
          close={closeRemoveModal}
        />
      )}
    </Dropdown>
  );
};

export default ComponentMenu;
