import { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import { type CollectionHit } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import BaseCard from './BaseCard';
import { ToastContext } from '../../generic/toast-context';
import { useDeleteCollection, useRestoreCollection } from '../data/apiHooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';

type CollectionMenuProps = {
  hit: CollectionHit,
};

const CollectionMenu = ({ hit } : CollectionMenuProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { closeLibrarySidebar, sidebarComponentInfo } = useSidebarContext();
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
    if (sidebarComponentInfo?.id === blockId) {
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
  }, [sidebarComponentInfo?.id]);

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
          <Dropdown.Item
            as={Link}
            to={`/library/${contextKey}/collection/${blockId}`}
          >
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
        variant="warning"
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
  const { showOnlyPublished } = useLibraryContext();
  const { openCollectionInfoSidebar, sidebarComponentInfo } = useSidebarContext();

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

  const selected = sidebarComponentInfo?.type === SidebarBodyComponentId.CollectionInfo
    && sidebarComponentInfo.id === collectionId;

  const { navigateTo } = useLibraryRoutes();
  const openCollection = useCallback(() => {
    openCollectionInfoSidebar(collectionId);

    if (!componentPickerMode) {
      navigateTo({ collectionId });
    }
  }, [collectionId, navigateTo, openCollectionInfoSidebar]);

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
      onSelect={openCollection}
      selected={selected}
    />
  );
};

export default CollectionCard;
