import { useCallback, useContext, useState } from 'react';
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
import { useLibraryContext } from '../common/context';
import BaseComponentCard from './BaseComponentCard';
import { ToastContext } from '../../generic/toast-context';
import { useDeleteCollection, useRestoreCollection } from '../data/apiHooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';

type CollectionMenuProps = {
  collectionHit: CollectionHit,
};

const CollectionMenu = ({ collectionHit } : CollectionMenuProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [confirmBtnState, setConfirmBtnState] = useState('default');
  const { closeLibrarySidebar, sidebarComponentInfo } = useLibraryContext();

  const restoreCollectionMutation = useRestoreCollection(collectionHit.contextKey, collectionHit.blockId);
  const restoreCollection = useCallback(() => {
    restoreCollectionMutation.mutateAsync()
      .then(() => {
        showToast(intl.formatMessage(messages.undoDeleteCollectionToastMessage));
      }).catch(() => {
        showToast(intl.formatMessage(messages.undoDeleteCollectionToastFailed));
      });
  }, []);

  const deleteCollectionMutation = useDeleteCollection(collectionHit.contextKey, collectionHit.blockId);
  const deleteCollection = useCallback(() => {
    setConfirmBtnState('pending');
    if (sidebarComponentInfo?.id === collectionHit.blockId) {
      // Close sidebar if current collection is open to avoid displaying
      // deleted collection in sidebar
      closeLibrarySidebar();
    }
    deleteCollectionMutation.mutateAsync()
      .then(() => {
        showToast(
          intl.formatMessage(messages.deleteCollectionSuccess),
          {
            label: intl.formatMessage(messages.undoDeleteCollectionToastAction),
            onClick: restoreCollection,
          },
        );
      }).catch(() => {
        showToast(intl.formatMessage(messages.deleteCollectionFailed));
      }).finally(() => {
        setConfirmBtnState('default');
        closeDeleteModal();
      });
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
            to={`/library/${collectionHit.contextKey}/collection/${collectionHit.blockId}/`}
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
        category={collectionHit.type}
        description={intl.formatMessage(messages.deleteCollectionConfirm, {
          collectionTitle: collectionHit.displayName,
        })}
        onDeleteSubmit={deleteCollection}
        btnState={confirmBtnState}
      />
    </>
  );
};

type CollectionCardProps = {
  collectionHit: CollectionHit,
};

const CollectionCard = ({ collectionHit } : CollectionCardProps) => {
  const {
    openCollectionInfoSidebar,
    componentPickerMode,
    showOnlyPublished,
  } = useLibraryContext();

  const {
    type: componentType,
    formatted,
    tags,
    numChildren,
    published,
  } = collectionHit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const { displayName = '', description = '' } = formatted;

  return (
    <BaseComponentCard
      componentType={componentType}
      displayName={displayName}
      description={description}
      tags={tags}
      numChildren={numChildrenCount}
      actions={!componentPickerMode && (
        <ActionRow>
          <CollectionMenu collectionHit={collectionHit} />
        </ActionRow>
      )}
      openInfoSidebar={() => openCollectionInfoSidebar(collectionHit.blockId)}
    />
  );
};

export default CollectionCard;
