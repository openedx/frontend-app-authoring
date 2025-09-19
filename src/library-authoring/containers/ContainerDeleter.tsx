import { useCallback, useContext, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Error, Delete, School } from '@openedx/paragon/icons';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { ContainerType } from '@src/generic/key-utils';
import { type ContainerHit } from '@src/search-manager';
import { useEntityLinks } from '@src/course-libraries/data/apiHooks';

import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContentFromSearchIndex, useDeleteContainer, useRestoreContainer } from '../data/apiHooks';
import messages from './messages';

type ContainerDeleterProps = {
  close: () => void,
  containerId: string,
};

type ContainerParents = {
  displayName?: string[],
  key?: string[],
};

const getOtherParentContainers = (containerParents?: ContainerParents, currentParentId?: string) => {
  const currentParentIndex = containerParents?.key?.findIndex((id) => id === currentParentId);
  return containerParents?.displayName?.filter(
    (_, index) => index !== currentParentIndex,
  );
};

const ContainerDeleter = ({
  close,
  containerId,
}: ContainerDeleterProps) => {
  const intl = useIntl();
  const {
    sidebarItemInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const {
    containerId: parentContainerId,
  } = useLibraryContext();
  const deleteContainerMutation = useDeleteContainer(containerId);
  const restoreContainerMutation = useRestoreContainer(containerId);
  const { showToast } = useContext(ToastContext);
  const { hits, isPending } = useContentFromSearchIndex([containerId]);
  const containerData = (hits as ContainerHit[])?.[0];
  const {
    data: dataDownstreamLinks,
    isPending: isPendingLinks,
  } = useEntityLinks({ upstreamKey: containerId, contentType: 'containers' });
  const downstreamCount = dataDownstreamLinks?.length ?? 0;

  const messageMap = useMemo(() => {
    const containerType = containerData?.blockType;
    let otherParentContainers: string[] | undefined;
    let otherParentCount = 0;
    let parentMessage: React.ReactNode;
    switch (containerType) {
      case ContainerType.Section:
        return {
          title: intl.formatMessage(messages.deleteSectionWarningTitle),
          parentMessage: '',
          courseCount: downstreamCount,
          courseMessage: messages.deleteSectionCourseMessage,
          deleteSuccess: intl.formatMessage(messages.deleteSectionSuccess),
          deleteError: intl.formatMessage(messages.deleteSectionFailed),
          undoDeleteError: messages.undoDeleteSectionToastFailed,
        };
      case ContainerType.Subsection:
        otherParentContainers = getOtherParentContainers(containerData?.sections, parentContainerId);
        otherParentCount = otherParentContainers?.length || 0;
        if (otherParentCount === 1) {
          parentMessage = intl.formatMessage(
            messages.deleteSubsectionParentMessage,
            { parentName: <b>{containerData?.sections?.displayName?.[0]}</b> },
          );
        } else if (otherParentCount > 1) {
          parentMessage = intl.formatMessage(messages.deleteSubsectionMultipleParentMessage, {
            parentCount: <b>{otherParentCount}</b>,
          });
        }
        return {
          title: intl.formatMessage(messages.deleteSubsectionWarningTitle),
          parentMessage,
          courseCount: downstreamCount,
          courseMessage: messages.deleteSubsectionCourseMessage,
          deleteSuccess: intl.formatMessage(messages.deleteSubsectionSuccess),
          deleteError: intl.formatMessage(messages.deleteSubsectionFailed),
          undoDeleteError: messages.undoDeleteSubsectionToastFailed,
        };
      default: // Unit
        otherParentContainers = getOtherParentContainers(containerData?.subsections, parentContainerId);
        otherParentCount = otherParentContainers?.length || 0;
        if (otherParentCount === 1) {
          parentMessage = intl.formatMessage(
            messages.deleteUnitParentMessage,
            { parentName: <b>{otherParentContainers?.[0]}</b> },
          );
        } else if (otherParentCount > 1) {
          parentMessage = intl.formatMessage(messages.deleteUnitMultipleParentMessage, {
            parentCount: <b>{otherParentCount}</b>,
          });
        }
        return {
          title: intl.formatMessage(messages.deleteUnitWarningTitle),
          parentMessage,
          courseCount: downstreamCount,
          courseMessage: messages.deleteUnitCourseMessage,
          deleteSuccess: intl.formatMessage(messages.deleteUnitSuccess),
          deleteError: intl.formatMessage(messages.deleteUnitFailed),
          undoDeleteError: messages.undoDeleteUnitToastFailed,
        };
    }
  }, [containerData, downstreamCount, messages, intl]);

  const deleteText = intl.formatMessage(messages.deleteContainerConfirm, {
    containerName: <b>{containerData?.displayName}</b>,
    message: (
      <div className="text-danger-900">
        {messageMap.parentMessage && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2" src={Error} />
            <span>{messageMap.parentMessage}</span>
          </div>
        )}
        {(messageMap.courseCount || 0) > 0 && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2" src={School} />
            <span>
              {intl.formatMessage(messageMap.courseMessage, {
                courseCount: messageMap.courseCount,
                courseCountText: <b>{messageMap.courseCount}</b>,
              })}
            </span>
          </div>
        )}
      </div>
    ),
  });

  const restoreComponent = useCallback(async () => {
    try {
      await restoreContainerMutation.mutateAsync();
      showToast(intl.formatMessage(messages.undoDeleteContainerToastMessage));
    } catch (e) {
      showToast(intl.formatMessage(messageMap.undoDeleteError));
    }
  }, [messageMap]);

  const onDelete = useCallback(async () => {
    await deleteContainerMutation.mutateAsync().then(() => {
      if (sidebarItemInfo?.id === containerId) {
        closeLibrarySidebar();
      }
      showToast(
        messageMap.deleteSuccess,
        {
          label: intl.formatMessage(messages.undoDeleteContainerToastAction),
          onClick: restoreComponent,
        },
      );
    }).catch(() => {
      showToast(messageMap.deleteError);
    }).finally(() => {
      close();
    });
  }, [sidebarItemInfo, showToast, deleteContainerMutation, messageMap]);

  // istanbul ignore if: loading state
  if (isPending || isPendingLinks) {
    // Only render the modal after loading
    return null;
  }

  return (
    <DeleteModal
      isOpen
      close={close}
      variant="danger"
      title={messageMap?.title}
      icon={Delete}
      description={deleteText}
      onDeleteSubmit={onDelete}
    />
  );
};

export default ContainerDeleter;
