import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { getBlockType } from '@src/generic/key-utils';

import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContainer, useRemoveContainerChildren } from '../data/apiHooks';
import messages from '../components/messages';

type ContainerRemoverProps = {
  close: () => void,
  containerKey: string,
  displayName: string,
};

const ContainerRemover = ({
  close,
  containerKey,
  displayName,
}: ContainerRemoverProps) => {
  const intl = useIntl();
  const {
    sidebarItemInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const { containerId } = useLibraryContext();
  const { showToast } = useContext(ToastContext);

  const removeContainerMutation = useRemoveContainerChildren(containerId);
  const { data: container, isPending } = useContainer(containerId);
  const itemType = getBlockType(containerKey);

  const removeWarningTitle = intl.formatMessage(messages.removeContainerWarningTitle, {
    containerType: capitalize(itemType),
  });

  const removeText = intl.formatMessage(messages.removeContainerConfirm, {
    containerName: <b>{displayName}</b>,
    containerType: capitalize(itemType),
    parentContainerName: <b>{container?.displayName}</b>,
  });

  const removeSuccess = intl.formatMessage(messages.removeComponentFromContainerSuccess);
  const removeError = intl.formatMessage(messages.removeComponentFromContainerFailure);

  const onRemove = useCallback(async () => {
    try {
      await removeContainerMutation.mutateAsync([containerKey]);
      if (sidebarItemInfo?.id === containerKey) {
        closeLibrarySidebar();
      }
      showToast(removeSuccess);
    } catch {
      showToast(removeError);
    } finally {
      close();
    }
  }, [
    containerKey,
    removeContainerMutation,
    sidebarItemInfo,
    closeLibrarySidebar,
    showToast,
    removeSuccess,
    removeError,
    close,
  ]);

  // istanbul ignore if: loading state
  if (isPending) {
    // Only render when data is ready
    return null;
  }

  return (
    <DeleteModal
      isOpen
      close={close}
      title={removeWarningTitle}
      variant="warning"
      icon={Warning}
      description={removeText}
      onDeleteSubmit={onRemove}
      buttonVariant="primary"
      btnLabel={intl.formatMessage(messages.removeContainerButton)}
    />
  );
};

export default ContainerRemover;
