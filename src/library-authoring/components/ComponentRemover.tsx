import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Warning } from '@openedx/paragon/icons';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import {
  useContainer,
  useRemoveContainerChildren,
  useAddItemsToContainer,
  useLibraryBlockMetadata,
} from '../data/apiHooks';
import messages from './messages';

interface Props {
  usageKey: string;
  close: () => void;
}

const ComponentRemover = ({ usageKey, close }: Props) => {
  const intl = useIntl();
  const { sidebarItemInfo, closeLibrarySidebar } = useSidebarContext();
  const { containerId } = useLibraryContext();
  const { showToast } = useContext(ToastContext);

  const removeContainerItemMutation = useRemoveContainerChildren(containerId);
  const addItemToContainerMutation = useAddItemsToContainer(containerId);
  const { data: container, isPending: isPendingParentContainer } = useContainer(containerId);
  const { data: component, isPending } = useLibraryBlockMetadata(usageKey);

  // istanbul ignore if: loading state
  if (isPending || isPendingParentContainer) {
    // Only show the modal when all data is ready
    return null;
  }

  const removeFromContainer = () => {
    const restoreComponent = () => {
      addItemToContainerMutation.mutateAsync([usageKey]).then(() => {
        showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastSuccess));
      }).catch(() => {
        showToast(intl.formatMessage(messages.undoRemoveComponentFromContainerToastFailed));
      });
    };
    removeContainerItemMutation.mutateAsync([usageKey]).then(() => {
      if (sidebarItemInfo?.id === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(
        intl.formatMessage(messages.removeComponentFromContainerSuccess),
        {
          label: intl.formatMessage(messages.undoRemoveComponentFromContainerToastAction),
          onClick: restoreComponent,
        },
      );
    }).catch(() => {
      showToast(intl.formatMessage(messages.removeComponentFromContainerFailure));
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
      onDeleteSubmit={removeFromContainer}
      btnLabel={intl.formatMessage(messages.componentRemoveButtonLabel)}
      buttonVariant="primary"
    />
  );
};

export default ComponentRemover;
