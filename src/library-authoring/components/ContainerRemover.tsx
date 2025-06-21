import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { capitalize } from 'lodash';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { ToastContext } from '../../generic/toast-context';
import { useContainer, useRemoveContainerChildren } from '../data/apiHooks';
import messages from './messages';
import { getBlockType } from '../../generic/key-utils';

type ContainerRemoverProps = {
  isOpen: boolean,
  close: () => void,
  containerKey: string,
  displayName: string,
};

const ContainerRemover = ({
  isOpen,
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
  const { data: container } = useContainer(containerId);
  const itemType = getBlockType(containerKey);

  const removeWarningTitle = intl.formatMessage(messages.removeContainerWarningTitle, {
    containerType: capitalize(itemType),
  });

  const removeText = intl.formatMessage(messages.removeContainerConfirm, {
    containerName: <b>{capitalize(itemType)} {displayName}</b>,
    containerType: capitalize(itemType),
    parentContainerType: capitalize(container?.containerType),
    parentContainerName: container?.displayName,
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
    } catch (e) {
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

  return (
    <DeleteModal
      isOpen={isOpen}
      close={close}
      title={removeWarningTitle}
      description={removeText}
      onDeleteSubmit={onRemove}
      btnLabel={intl.formatMessage(messages.removeContainerButton, {
        containerName: itemType.charAt(0).toUpperCase() + itemType.slice(1),
      })}
    />
  );
};

export default ContainerRemover;
