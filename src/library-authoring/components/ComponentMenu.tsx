import { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import { useClipboard } from '../../generic/clipboard';
import { ToastContext } from '../../generic/toast-context';
import {
  useAddItemsToContainer,
  useRemoveContainerChildren,
  useRemoveItemsFromCollection,
} from '../data/apiHooks';
import { canEditComponent } from './ComponentEditorModal';
import ComponentDeleter from './ComponentDeleter';
import messages from './messages';
import containerMessages from '../containers/messages';
import { useLibraryRoutes } from '../routes';
import { useRunOnNextRender } from '../../utils';

export const ComponentMenu = ({ usageKey }: { usageKey: string }) => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    containerId,
    openComponentEditor,
  } = useLibraryContext();

  const {
    sidebarItemInfo,
    openComponentInfoSidebar,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();
  const { navigateTo, insideCollection } = useLibraryRoutes();

  const canEdit = usageKey && canEditComponent(usageKey);
  const { showToast } = useContext(ToastContext);
  const addItemToContainerMutation = useAddItemsToContainer(containerId);
  const removeCollectionComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);
  const removeContainerItemMutation = useRemoveContainerChildren(containerId);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const { copyToClipboard } = useClipboard();

  const updateClipboardClick = () => {
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

  const removeFromContainer = () => {
    const restoreComponent = () => {
      addItemToContainerMutation.mutateAsync([usageKey]).then(() => {
        showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastSuccess));
      }).catch(() => {
        showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastFailed));
      });
    };

    removeContainerItemMutation.mutateAsync([usageKey]).then(() => {
      if (sidebarItemInfo?.id === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(
        intl.formatMessage(messages.removeComponentFromContainerSuccess),
        {
          label: intl.formatMessage(messages.undoRemoveComponentFromContainerToastAction),
          onClick: restoreComponent,
        },
      );
    }).catch(() => {
      showToast(intl.formatMessage(messages.removeComponentFromContainerFailure));
    });
  };

  const handleEdit = useCallback(() => {
    navigateTo({ selectedItemId: usageKey });
    openComponentEditor(usageKey);
  }, [usageKey, navigateTo]);

  const scheduleJumpToCollection = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows add to collection section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageCollections), 250);
  });

  const showManageCollections = useCallback(() => {
    navigateTo({ selectedItemId: usageKey });
    scheduleJumpToCollection();
  }, [
    scheduleJumpToCollection,
    openComponentInfoSidebar,
    usageKey,
    navigateTo,
  ]);

  return (
    <Dropdown id="component-card-dropdown">
      <Dropdown.Toggle
        id="component-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.componentCardMenuAlt)}
        data-testid="component-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item {...(canEdit ? { onClick: handleEdit } : { disabled: true })}>
          <FormattedMessage {...messages.menuEdit} />
        </Dropdown.Item>
        <Dropdown.Item onClick={updateClipboardClick}>
          <FormattedMessage {...messages.menuCopyToClipboard} />
        </Dropdown.Item>
        {containerId && (
          <Dropdown.Item onClick={removeFromContainer}>
            <FormattedMessage {...messages.removeComponentFromUnitMenu} />
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={confirmDelete}>
          <FormattedMessage {...messages.menuDelete} />
        </Dropdown.Item>
        {insideCollection && (
          <Dropdown.Item onClick={removeFromCollection}>
            <FormattedMessage {...containerMessages.menuRemoveFromCollection} />
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={showManageCollections}>
          <FormattedMessage {...containerMessages.menuAddToCollection} />
        </Dropdown.Item>
      </Dropdown.Menu>
      {isConfirmingDelete && (
        <ComponentDeleter
          usageKey={usageKey}
          isConfirmingDelete={isConfirmingDelete}
          cancelDelete={cancelDelete}
        />
      )}
    </Dropdown>
  );
};

export default ComponentMenu;
