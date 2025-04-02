import { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert, Warning } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import { type ContainerHit, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';
import BaseCard from './BaseCard';
import messages from './messages';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { ToastContext } from '../../generic/toast-context';
import { useDeleteContainer } from '../data/apiHooks';

type ContainerMenuProps = {
  hit: ContainerHit,
};

const ContainerMenu = ({ hit } : ContainerMenuProps) => {
  const intl = useIntl();
  const { contextKey, blockId } = hit;

  const {
    usageKey,
    blockType: componentType,
    displayName,
  } = hit;
  const {
    sidebarComponentInfo,
    closeLibrarySidebar,
  } = useSidebarContext();

  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const { showToast } = useContext(ToastContext);
  const deleteContainerMutation = useDeleteContainer(usageKey);

  let deleteWarningTitle;
  let deleteText;
  let deleteSuccess;
  let deleteError;
  if (componentType === 'unit') {
    deleteWarningTitle = intl.formatMessage(messages.deleteUnitWarningTitle);
    deleteText = intl.formatMessage(messages.deleteUnitConfirm, {
      componentName: displayName,
    });
    deleteSuccess = intl.formatMessage(messages.deleteUnitSuccess);
    deleteError = intl.formatMessage(messages.deleteUnitFailed);
  }

  const onDelete = useCallback(() => {
    deleteContainerMutation.mutateAsync().then(() => {
      if (sidebarComponentInfo?.id === usageKey) {
        closeLibrarySidebar();
      }
      showToast(deleteSuccess);
    }).catch(() => {
      showToast(deleteError);
    });
  }, [sidebarComponentInfo, showToast, deleteContainerMutation]);

  return (
    <Dropdown id="container-card-dropdown">
      <Dropdown.Toggle
        id="container-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.collectionCardMenuAlt)}
        data-testid="container-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={`/library/${contextKey}/container/${blockId}`}
          disabled
        >
          <FormattedMessage {...messages.menuOpen} />
        </Dropdown.Item>
        <Dropdown.Item onClick={confirmDelete}>
          <FormattedMessage {...messages.menuDeleteContainer} />
        </Dropdown.Item>
      </Dropdown.Menu>
      <DeleteModal
        isOpen={isConfirmingDelete}
        close={cancelDelete}
        variant="warning"
        title={deleteWarningTitle}
        icon={Warning}
        description={deleteText}
        onDeleteSubmit={onDelete}
      />
    </Dropdown>
  );
};

type ContainerCardProps = {
  hit: ContainerHit,
};

const ContainerCard = ({ hit } : ContainerCardProps) => {
  const { componentPickerMode } = useComponentPickerContext();
  const { showOnlyPublished } = useLibraryContext();
  const { openUnitInfoSidebar } = useSidebarContext();

  const {
    blockType: itemType,
    formatted,
    tags,
    numChildren,
    published,
    publishStatus,
    usageKey: unitId,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const { navigateTo } = useLibraryRoutes();

  const openContainer = useCallback(() => {
    if (itemType === 'unit') {
      openUnitInfoSidebar(unitId);

      navigateTo({ unitId });
    }
  }, [unitId, itemType, openUnitInfoSidebar, navigateTo]);

  return (
    <BaseCard
      itemType={itemType}
      displayName={displayName}
      tags={tags}
      numChildren={numChildrenCount}
      actions={!componentPickerMode && (
        <ActionRow>
          <ContainerMenu hit={hit} />
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={openContainer}
    />
  );
};

export default ContainerCard;
