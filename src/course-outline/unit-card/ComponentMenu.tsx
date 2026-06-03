import {
  useCallback, useContext, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import cardHeaderMessages from '@src/course-outline/card-header/messages';
import { PUBLISH_TYPES } from '@src/course-unit/constants';
import { editCourseUnitVisibilityAndData } from '@src/course-unit/data/thunk';
import MoveModal from '@src/course-unit/move-modal';
import type { IMoveRequestPayload } from '@src/course-unit/move-modal/interfaces';
import { formatAccessManagedXBlockData } from '@src/course-unit/xblock-container-iframe/utils';
import type { FormattedAccessManagedXBlockDataTypes, XBlockTypes } from '@src/course-unit/xblock-container-iframe/types';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { useClipboard } from '@src/generic/clipboard';
import { ToastContext } from '@src/generic/toast-context';
import moveModalMessages from '@src/course-unit/move-modal/messages';

import type { UnitComponentActions } from './data/api';
import { useDeleteUnitComponent, useDuplicateUnitComponent } from './data/hooks';
import messages from './messages';

interface ComponentMenuProps {
  unitId: string;
  blockId: string;
  displayName: string;
  blockType: string;
  userPartitionInfo?: XBlockTypes['userPartitionInfo'];
  userPartitions?: XBlockTypes['userPartitions'];
  actions: UnitComponentActions;
  onActionComplete: (targetUnitId?: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: (blockId: string | null) => void;
}

const stopMenuEvent = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

const ComponentMenu = ({
  unitId,
  blockId,
  displayName,
  blockType,
  userPartitionInfo,
  userPartitions,
  actions,
  onActionComplete,
  isMenuOpen,
  onMenuToggle,
}: ComponentMenuProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const { showToast } = useContext(ToastContext);
  const { copyToClipboard } = useClipboard();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [isMoveModalOpen, openMoveModal, closeMoveModal] = useToggle(false);
  const [moveRequest, setMoveRequest] = useState<IMoveRequestPayload | null>(null);
  const [configureItemData, setConfigureItemData] = useState<FormattedAccessManagedXBlockDataTypes | null>(null);
  const { mutateAsync: deleteComponent } = useDeleteUnitComponent();
  const { mutateAsync: duplicateComponent } = useDuplicateUnitComponent(unitId);

  const handleManageAccess = useCallback((event: React.MouseEvent) => {
    stopMenuEvent(event);
    setConfigureItemData(formatAccessManagedXBlockData({
      name: displayName,
      blockType,
      blockId,
      id: blockId,
      userPartitionInfo,
      userPartitions,
    } as XBlockTypes, blockId));
    openConfigureModal();
  }, [
    blockId,
    blockType,
    displayName,
    openConfigureModal,
    userPartitionInfo,
    userPartitions,
  ]);

  const handleConfigureSubmit = useCallback((
    isVisible: boolean,
    groupAccess: unknown,
    isDiscussionEnabled: boolean,
  ) => {
    dispatch(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.republish,
      isVisible,
      groupAccess,
      isDiscussionEnabled,
      onActionComplete,
      unitId,
    ));
    closeConfigureModal();
    setConfigureItemData(null);
  }, [blockId, closeConfigureModal, dispatch, onActionComplete, unitId]);

  const handleConfigureClose = useCallback(() => {
    closeConfigureModal();
    setConfigureItemData(null);
  }, [closeConfigureModal]);

  const handleMove = useCallback((event: React.MouseEvent) => {
    stopMenuEvent(event);
    setMoveRequest({
      sourceXBlockInfo: { id: blockId, displayName },
      sourceParentXBlockInfo: {
        id: unitId,
        displayName: '',
        category: 'vertical',
        hasChildren: true,
      },
    });
    openMoveModal();
  }, [blockId, displayName, openMoveModal, unitId]);

  const handleMoveModalClose = useCallback(() => {
    closeMoveModal();
    setMoveRequest(null);
  }, [closeMoveModal]);

  const handleDuplicate = useCallback(async (event: React.MouseEvent) => {
    stopMenuEvent(event);
    try {
      await duplicateComponent(blockId);
      onActionComplete();
    } catch {
      showToast(intl.formatMessage(messages.componentDuplicateError));
    }
  }, [blockId, duplicateComponent, onActionComplete, showToast, intl]);

  const handleDeleteSubmit = useCallback(async () => {
    try {
      await deleteComponent(blockId);
      closeDeleteModal();
      onActionComplete();
    } catch {
      closeDeleteModal();
      showToast(intl.formatMessage(messages.componentDeleteError));
    }
  }, [blockId, closeDeleteModal, deleteComponent, onActionComplete, showToast, intl]);

  const {
    canManageAccess, canMove, canCopy, canDuplicate, canDelete,
  } = actions;
  if (!canManageAccess && !canMove && !canCopy && !canDuplicate && !canDelete) {
    return null;
  }

  const menuItemProps = { onMouseDown: stopMenuEvent };

  return (
    <>
      <span
        className="component-menu-wrapper flex-shrink-0"
        role="presentation"
        onClick={stopMenuEvent}
        onMouseDown={stopMenuEvent}
        onKeyDown={stopMenuEvent}
      >
        <Dropdown
          id={`component-menu-${blockId}`}
          key={`${blockId}-${isMenuOpen}`}
          data-testid="component-menu"
          show={isMenuOpen}
          onToggle={(isOpen, event) => {
            event?.stopPropagation();
            onMenuToggle(isOpen ? blockId : null);
          }}
        >
          <Dropdown.Toggle
            id={`component-menu-toggle-${blockId}`}
            as={IconButton}
            src={MoreVert}
            iconAs={Icon}
            size="sm"
            variant="primary"
            alt={intl.formatMessage(messages.componentMenuAlt)}
            data-testid="component-menu-toggle"
            className="component-card-button-icon ml-1"
            onMouseDown={stopMenuEvent}
          />
          <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
            {canManageAccess && (
              <Dropdown.Item
                {...menuItemProps}
                onClick={handleManageAccess}
                data-testid="component-menu-manage-access"
              >
                <FormattedMessage {...messages.menuManageAccess} />
              </Dropdown.Item>
            )}
            {canMove && (
              <Dropdown.Item
                {...menuItemProps}
                onClick={handleMove}
                data-testid="component-menu-move"
              >
                <FormattedMessage {...moveModalMessages.moveModalSubmitButton} />
              </Dropdown.Item>
            )}
            {canCopy && (
              <Dropdown.Item
                {...menuItemProps}
                onClick={(event) => {
                  stopMenuEvent(event);
                  copyToClipboard(blockId);
                }}
                data-testid="component-menu-copy"
              >
                <FormattedMessage {...cardHeaderMessages.menuCopy} />
              </Dropdown.Item>
            )}
            {canDuplicate && (
              <Dropdown.Item
                {...menuItemProps}
                onClick={handleDuplicate}
                data-testid="component-menu-duplicate"
              >
                <FormattedMessage {...cardHeaderMessages.menuDuplicate} />
              </Dropdown.Item>
            )}
            {canDelete && (
              <Dropdown.Item
                {...menuItemProps}
                onClick={(event) => {
                  stopMenuEvent(event);
                  openDeleteModal();
                }}
                data-testid="component-menu-delete"
              >
                <FormattedMessage {...cardHeaderMessages.menuDelete} />
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </span>
      {isConfigureModalOpen && configureItemData && (
        <ConfigureModal
          key={configureItemData.id}
          isXBlockComponent
          isOpen={isConfigureModalOpen}
          onClose={handleConfigureClose}
          onConfigureSubmit={handleConfigureSubmit}
          currentItemData={configureItemData}
          isSelfPaced={false}
        />
      )}
      {isMoveModalOpen && courseId && (
        <IframeProvider>
          <MoveModal
            isOpenModal={isMoveModalOpen}
            openModal={openMoveModal}
            closeModal={handleMoveModalClose}
            courseId={courseId}
            currentParentLocator={unitId}
            moveRequest={moveRequest}
            onMoveComplete={onActionComplete}
          />
        </IframeProvider>
      )}
      <DeleteModal
        category="component"
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteSubmit}
      />
    </>
  );
};

export default ComponentMenu;
