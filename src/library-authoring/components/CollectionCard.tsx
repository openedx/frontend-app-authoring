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
import { useLibraryContext } from '../common/context';
import BaseComponentCard from './BaseComponentCard';
import { ToastContext } from '../../generic/toast-context';
import { useDeleteCollection, useRestoreCollection } from '../data/apiHooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import messages from './messages';

type CollectionCardProps = {
  collectionHit: CollectionHit,
};

const CollectionMenu = ({ collectionHit } : CollectionCardProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);

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
    deleteCollectionMutation.mutateAsync()
      .then(() => {
        showToast(
          intl.formatMessage(messages.deleteCollectionSuccess),
          {
            label: intl.formatMessage(messages.undoDeleteCollectionToastAction),
            onClick: restoreCollection,
          }
        );
      }).catch(() => {
        showToast(intl.formatMessage(messages.deleteCollectionFailed));
      });
  }, []);

  return (
    <>
      <Dropdown id="collection-card-dropdown" onClick={(e) => e.stopPropagation()}>
        <Dropdown.Toggle
          id="collection-card-menu-toggle"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={intl.formatMessage(messages.componentCardMenuAlt)}
          data-testid="collection-card-menu-toggle"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={openDeleteModal}>
            <FormattedMessage {...messages.deleteCollection} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        category={collectionHit.type}
        description={intl.formatMessage(messages.deleteCollectionConfirm, {
          collectionTitle: collectionHit.displayName,
        })}
        onDeleteSubmit={deleteCollection}
      />
    </>
  );
};

const CollectionCard = ({ collectionHit } : CollectionCardProps) => {
  const intl = useIntl();
  const {
    openCollectionInfoSidebar,
  } = useLibraryContext();

  const {
    type: componentType,
    formatted,
    tags,
    numChildren,
  } = collectionHit;
  const { displayName = '', description = '' } = formatted;

  return (
    <BaseComponentCard
      componentType={componentType}
      displayName={displayName}
      description={description}
      tags={tags}
      numChildren={numChildren}
      actions={(
        <ActionRow>
          <CollectionMenu collectionHit={collectionHit} />
        </ActionRow>
      )}
      openInfoSidebar={() => openCollectionInfoSidebar(collectionHit.blockId)}
    />
  );
};

export default CollectionCard;
