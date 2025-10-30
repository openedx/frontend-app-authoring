import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { useSidebarContext } from '@src/library-authoring/common/context/SidebarContext';
import {
  useContainer,
  useRemoveContainerChildren,
  useLibraryBlockMetadata,
  useContainerChildren,
  useUpdateContainerChildren,
} from '@src/library-authoring/data/apiHooks';
import { LibraryBlockMetadata } from '@src/library-authoring/data/api';
import messages from './messages';

interface Props {
  usageKey: string;
  index?: number;
  close: () => void;
}

const ComponentRemover = ({ usageKey, index, close }: Props) => {
  const intl = useIntl();
  const { sidebarItemInfo, closeLibrarySidebar } = useSidebarContext();
  const { containerId, showOnlyPublished } = useLibraryContext();
  const { showToast } = useContext(ToastContext);

  const removeContainerItemMutation = useRemoveContainerChildren(containerId);
  const updateContainerChildrenMutation = useUpdateContainerChildren(containerId);
  const { data: container, isPending: isPendingParentContainer } = useContainer(containerId);
  const { data: component, isPending } = useLibraryBlockMetadata(usageKey);
  // Use update api for children if duplicates are present to avoid removing all instances of the child
  const { data: children } = useContainerChildren<LibraryBlockMetadata>(containerId, showOnlyPublished);
  const childrenUsageIds = children?.map((child) => child.id);
  const hasDuplicates = (childrenUsageIds?.filter((child) => child === usageKey).length || 0) > 1;

  // istanbul ignore if: loading state
  if (isPending || isPendingParentContainer) {
    // Only show the modal when all data is ready
    return null;
  }

  const restoreComponent = () => {
    // istanbul ignore if: this should never happen
    if (!childrenUsageIds) {
      return;
    }
    updateContainerChildrenMutation.mutateAsync(childrenUsageIds).then(() => {
      showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastSuccess));
    }).catch(() => {
      showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastFailed));
    });
  };

  const showSuccessToast = () => {
    showToast(
      intl.formatMessage(messages.removeComponentFromContainerSuccess),
      {
        label: intl.formatMessage(messages.undoRemoveComponentFromContainerToastAction),
        onClick: restoreComponent,
      },
    );
  };

  const showFailureToast = () => showToast(intl.formatMessage(messages.removeComponentFromContainerFailure));

  const removeFromContainer = () => {
    removeContainerItemMutation.mutateAsync([usageKey]).then(() => {
      if (sidebarItemInfo?.id === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showSuccessToast();
    }).catch(() => {
      showFailureToast();
    });

    close();
  };

  const excludeOneInstance = () => {
    if (!childrenUsageIds || typeof index === 'undefined') {
      return;
    }
    const updatedKeys = childrenUsageIds.filter((childId, idx) => childId !== usageKey || idx !== index);
    updateContainerChildrenMutation.mutateAsync(updatedKeys).then(() => {
      // istanbul ignore if
      if (sidebarItemInfo?.id === usageKey && sidebarItemInfo?.index === index) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      // Already tested as part of removeFromContainer
      // istanbul ignore next
      showSuccessToast();
    }).catch(() => {
      // Already tested as part of removeFromContainer
      // istanbul ignore next
      showFailureToast();
    });

    close();
  };

  const removeText = intl.formatMessage(messages.removeComponentConfirm, {
    componentName: <b>{component?.displayName}</b>,
    parentContainerName: <b>{container?.displayName}</b>,
  });

  return (
    <DeleteModal
      isOpen
      close={close}
      variant="warning"
      title={intl.formatMessage(messages.removeComponentWarningTitle)}
      icon={Warning}
      description={removeText}
      onDeleteSubmit={hasDuplicates ? excludeOneInstance : removeFromContainer}
      btnLabel={intl.formatMessage(messages.componentRemoveButtonLabel)}
      buttonVariant="primary"
    />
  );
};

export default ComponentRemover;
