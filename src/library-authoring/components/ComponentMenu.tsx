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

import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { SidebarActions, SidebarBodyItemId, useSidebarContext } from '@src/library-authoring/common/context/SidebarContext';
import { useRemoveItemsFromCollection } from '@src/library-authoring/data/apiHooks';
import containerMessages from '@src/library-authoring/containers/messages';
import { useLibraryRoutes } from '@src/library-authoring/routes';
import { useRunOnNextRender } from '@src/utils';
import { canEditComponent } from './ComponentEditorModal';
import ComponentDeleter from './ComponentDeleter';
import ComponentRemover from './ComponentRemover';
import messages from './messages';

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
  } = useLibraryContext();

  const {
    sidebarItemInfo,
    closeLibrarySidebar,
    setSidebarAction,
    openItemSidebar,
  } = useSidebarContext();
  const { insideCollection } = useLibraryRoutes();

  const canEdit = usageKey && canEditComponent(usageKey);
  const { showToast } = useContext(ToastContext);
  const removeCollectionComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isRemoveModalOpen, openRemoveModal, closeRemoveModal] = useToggle(false);
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

  const handleEdit = useCallback(() => {
    openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo);
    openComponentEditor(usageKey);
  }, [usageKey, openItemSidebar, openComponentEditor]);

  const scheduleJumpToCollection = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows add to collection section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageCollections), 250);
  });

  const showManageCollections = useCallback(() => {
    openItemSidebar(usageKey, SidebarBodyItemId.ComponentInfo);
    scheduleJumpToCollection();
  }, [
    scheduleJumpToCollection,
    usageKey,
    openItemSidebar,
  ]);

  const containerType = containerId ? getBlockType(containerId) : 'collection';

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
        <Dropdown.Item {...(canEdit ? { onClick: handleEdit } : { disabled: true })}>
          <FormattedMessage {...messages.menuEdit} />
        </Dropdown.Item>
        <Dropdown.Item onClick={updateClipboardClick}>
          <FormattedMessage {...messages.menuCopyToClipboard} />
        </Dropdown.Item>
        {containerId && (
          <Dropdown.Item onClick={openRemoveModal}>
            <FormattedMessage {...messages.removeComponentFromUnitMenu} />
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={openDeleteModal}>
          <FormattedMessage {...messages.menuDelete} />
        </Dropdown.Item>
        {insideCollection && (
          <Dropdown.Item onClick={removeFromCollection}>
            <FormattedMessage
              {...containerMessages.menuRemoveFromContainer}
              values={{
                containerType,
              }}
            />
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={showManageCollections}>
          <FormattedMessage {...containerMessages.menuAddToCollection} />
        </Dropdown.Item>
      </Dropdown.Menu>
      {isDeleteModalOpen && (
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
