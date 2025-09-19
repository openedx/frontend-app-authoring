import { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { Delete, MoreVert } from '@openedx/paragon/icons';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { type CollectionHit } from '@src/search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarBodyItemId, useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import BaseCard from './BaseCard';
import { useDeleteCollection, useRestoreCollection } from '../data/apiHooks';
import messages from './messages';

type CollectionMenuProps = {
  hit: CollectionHit,
};

const CollectionMenu = ({ hit } : CollectionMenuProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const { navigateTo } = useLibraryRoutes();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { closeLibrarySidebar, sidebarItemInfo } = useSidebarContext();
  const {
    contextKey,
    blockId,
    type,
    displayName,
  } = hit;

  const restoreCollectionMutation = useRestoreCollection(contextKey, blockId);
  const restoreCollection = useCallback(() => {
    restoreCollectionMutation.mutateAsync()
      .then(() => {
        showToast(intl.formatMessage(messages.undoDeleteCollectionToastMessage));
      }).catch(() => {
        showToast(intl.formatMessage(messages.undoDeleteCollectionToastFailed));
      });
  }, []);

  const deleteCollectionMutation = useDeleteCollection(contextKey, blockId);
  const deleteCollection = useCallback(async () => {
    if (sidebarItemInfo?.id === blockId) {
      // Close sidebar if current collection is open to avoid displaying
      // deleted collection in sidebar
      closeLibrarySidebar();
    }
    try {
      await deleteCollectionMutation.mutateAsync();
      showToast(
        intl.formatMessage(messages.deleteCollectionSuccess),
        {
          label: intl.formatMessage(messages.undoDeleteCollectionToastAction),
          onClick: restoreCollection,
        },
      );
    } catch (e) {
      showToast(intl.formatMessage(messages.deleteCollectionFailed));
    } finally {
      closeDeleteModal();
    }
  }, [sidebarItemInfo?.id]);

  const openCollection = useCallback(() => {
    navigateTo({ collectionId: blockId });
  }, [blockId, navigateTo]);

  return (
    <>
      <Dropdown id="collection-card-dropdown">
        <Dropdown.Toggle
          id="collection-card-menu-toggle"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={intl.formatMessage(messages.collectionCardMenuAlt)}
          data-testid="collection-card-menu-toggle"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={openCollection}>
            <FormattedMessage {...messages.menuOpen} />
          </Dropdown.Item>
          <Dropdown.Item onClick={openDeleteModal}>
            <FormattedMessage {...messages.deleteCollection} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        variant="danger"
        icon={Delete}
        category={type}
        description={intl.formatMessage(messages.deleteCollectionConfirm, {
          collectionTitle: displayName,
        })}
        onDeleteSubmit={deleteCollection}
      />
    </>
  );
};

type CollectionCardProps = {
  hit: CollectionHit,
};

const CollectionCard = ({ hit } : CollectionCardProps) => {
  const { componentPickerMode } = useComponentPickerContext();
  const { setCollectionId, showOnlyPublished } = useLibraryContext();
  const { openCollectionInfoSidebar, openItemSidebar, sidebarItemInfo } = useSidebarContext();

  const {
    type: itemType,
    blockId: collectionId,
    formatted,
    tags,
    numChildren,
    published,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const { displayName = '', description = '' } = formatted;

  const selected = sidebarItemInfo?.type === SidebarBodyItemId.CollectionInfo
    && sidebarItemInfo.id === collectionId;

  const { navigateTo } = useLibraryRoutes();
  const selectCollection = useCallback((e?: React.MouseEvent) => {
    const doubleClicked = (e?.detail || 0) > 1;

    if (!componentPickerMode) {
      if (doubleClicked) {
        navigateTo({ collectionId });
      } else {
        openItemSidebar(collectionId, SidebarBodyItemId.CollectionInfo);
      }

      // In component picker mode, we want to open the sidebar or the collection
      // without changing the URL
    } else if (doubleClicked) {
      setCollectionId(collectionId);
    } else {
      openCollectionInfoSidebar(collectionId);
    }
  }, [collectionId, navigateTo, openItemSidebar, openCollectionInfoSidebar, setCollectionId, componentPickerMode]);

  return (
    <BaseCard
      itemType={itemType}
      displayName={displayName}
      description={description}
      tags={tags}
      numChildren={numChildrenCount}
      actions={!componentPickerMode && (
        <ActionRow>
          <CollectionMenu hit={hit} />
        </ActionRow>
      )}
      onSelect={selectCollection}
      selected={selected}
    />
  );
};

export default CollectionCard;
