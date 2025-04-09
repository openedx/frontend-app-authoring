import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { useSidebarContext } from '../common/context/SidebarContext';
import { ToastContext } from '../../generic/toast-context';
import { useDeleteContainer, useRestoreContainer } from '../data/apiHooks';
import messages from './messages';

type ContainerDeleterProps = {
  isOpen: boolean,
  close: () => void,
  containerId: string,
  displayName: string,
};

const ContainerDeleter = ({
  isOpen,
  close,
  containerId,
  displayName,
}: ContainerDeleterProps) => {
  const intl = useIntl();
  const {
    sidebarComponentInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const deleteContainerMutation = useDeleteContainer(containerId);
  const restoreContainerMutation = useRestoreContainer(containerId);
  const { showToast } = useContext(ToastContext);

  // TODO: support other container types besides 'unit'
  const deleteWarningTitle = intl.formatMessage(messages.deleteUnitWarningTitle);
  const deleteText = intl.formatMessage(messages.deleteUnitConfirm, {
    componentName: displayName,
  });
  const deleteSuccess = intl.formatMessage(messages.deleteUnitSuccess);
  const deleteError = intl.formatMessage(messages.deleteUnitFailed);
  const undoDeleteError = messages.undoDeleteUnitToastFailed;

  const restoreComponent = useCallback(async () => {
    try {
      await restoreContainerMutation.mutateAsync();
      showToast(intl.formatMessage(messages.undoDeleteContainerToastMessage));
    } catch (e) {
      showToast(intl.formatMessage(undoDeleteError));
    }
  }, []);

  const onDelete = useCallback(async () => {
    await deleteContainerMutation.mutateAsync().then(() => {
      if (sidebarComponentInfo?.id === containerId) {
        closeLibrarySidebar();
      }
      showToast(
        deleteSuccess,
        {
          label: intl.formatMessage(messages.undoDeleteContainerToastAction),
          onClick: restoreComponent,
        },
      );
    }).catch(() => {
      showToast(deleteError);
    }).finally(() => {
      close();
    });
  }, [sidebarComponentInfo, showToast, deleteContainerMutation]);

  return (
    <DeleteModal
      isOpen={isOpen}
      close={close}
      variant="warning"
      title={deleteWarningTitle}
      icon={Warning}
      description={deleteText}
      onDeleteSubmit={onDelete}
    />
  );
};

export default ContainerDeleter;
