import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { getBlockType } from '@src/generic/key-utils';

import { useSidebarContext } from '@src/library-authoring/common/context/SidebarContext';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import {
  useContainer, useContainerChildren, useRemoveContainerChildren, useUpdateContainerChildren,
} from '@src/library-authoring/data/apiHooks';
import messages from '@src/library-authoring/components/messages';
import { Container } from '@src/library-authoring/data/api';

type ContainerRemoverProps = {
  close: () => void,
  containerKey: string,
  displayName: string,
  index?: number,
};

const ContainerRemover = ({
  close,
  containerKey,
  displayName,
  index,
}: ContainerRemoverProps) => {
  const intl = useIntl();
  const {
    sidebarItemInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const { containerId, showOnlyPublished } = useLibraryContext();
  const { showToast } = useContext(ToastContext);

  const removeContainerMutation = useRemoveContainerChildren(containerId);
  const updateContainerChildrenMutation = useUpdateContainerChildren(containerId);
  const { data: container, isPending } = useContainer(containerId);
  // Use update api for children if duplicates are present to avoid removing all instances of the child
  const { data: children } = useContainerChildren<Container>(containerId, showOnlyPublished);
  const childrenUsageIds = children?.map((child) => child.id);
  const hasDuplicates = (childrenUsageIds?.filter((child) => child === containerKey).length || 0) > 1;
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
      if (hasDuplicates && childrenUsageIds && typeof index !== 'undefined') {
        const updatedKeys = childrenUsageIds.filter((childId, idx) => childId !== containerKey || idx !== index);
        await updateContainerChildrenMutation.mutateAsync(updatedKeys);
        // istanbul ignore if
        if (sidebarItemInfo?.id === containerKey && sidebarItemInfo?.index === index) {
          closeLibrarySidebar();
        }
      } else {
        await removeContainerMutation.mutateAsync([containerKey]);
        // istanbul ignore if
        if (sidebarItemInfo?.id === containerKey) {
          closeLibrarySidebar();
        }
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
    updateContainerChildrenMutation,
    sidebarItemInfo,
    closeLibrarySidebar,
    showToast,
    removeSuccess,
    removeError,
    close,
    hasDuplicates,
    childrenUsageIds,
    index,
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
