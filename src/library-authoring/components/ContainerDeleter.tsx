import { useCallback, useContext, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Error, Warning, School } from '@openedx/paragon/icons';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { useSidebarContext } from '../common/context/SidebarContext';
import { ToastContext } from '../../generic/toast-context';
import { useContentFromSearchIndex, useDeleteContainer, useRestoreContainer } from '../data/apiHooks';
import messages from './messages';
import { ContainerType } from '../../generic/key-utils';
import { ContainerHit } from '../../search-manager';
import { useContainerEntityLinks } from '../../course-libraries/data/apiHooks';

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
    sidebarItemInfo,
    closeLibrarySidebar,
  } = useSidebarContext();
  const deleteContainerMutation = useDeleteContainer(containerId);
  const restoreContainerMutation = useRestoreContainer(containerId);
  const { showToast } = useContext(ToastContext);
  const { hits } = useContentFromSearchIndex([containerId]);
  const containerData = (hits as ContainerHit[])?.[0];
  const {
    data: dataDownstreamLinks,
    isLoading,
    isError,
  } = useContainerEntityLinks({ upstreamContainerKey: containerId });
  const downstreamCount = dataDownstreamLinks?.length ?? 0;

  const messageMap = useMemo(() => {
    const containerType = containerData?.blockType;
    let parentCount = 0;
    let parentMessage: React.ReactNode;
    switch (containerType) {
      case ContainerType.Section:
        return {
          title: intl.formatMessage(messages.deleteSectionWarningTitle),
          parentMessage: '',
          // Update below fields when sections are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteSectionCourseMessaage,
        };
      case ContainerType.Subsection:
        parentCount = containerData?.sections?.displayName?.length || 0;
        if (parentCount === 1) {
          parentMessage = intl.formatMessage(
            messages.deleteSubsectionParentMessage,
            { parentName: <b>{containerData?.sections?.displayName?.[0]}</b> },
          );
        } else if (parentCount > 1) {
          parentMessage = intl.formatMessage(messages.deleteSubsectionMultipleParentMessage, {
            parentCount: <b>{parentCount}</b>,
          });
        }
        return {
          title: intl.formatMessage(messages.deleteSubsectionWarningTitle),
          parentMessage,
          // Update below fields when subsections are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteSubsectionCourseMessaage,
        };
      default:
        parentCount = containerData?.subsections?.displayName?.length || 0;
        if (parentCount === 1) {
          parentMessage = intl.formatMessage(
            messages.deleteUnitParentMessage,
            { parentName: <b>{containerData?.subsections?.displayName?.[0]}</b> },
          );
        } else if (parentCount > 1) {
          parentMessage = intl.formatMessage(messages.deleteUnitMultipleParentMessage, {
            parentCount: <b>{parentCount}</b>,
          });
        }
        return {
          title: intl.formatMessage(messages.deleteUnitWarningTitle),
          parentMessage,
          // Update below fields when unit are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteUnitCourseMessage,
        };
    }
  }, [containerData, downstreamCount, messages, intl]);

  const deleteText = intl.formatMessage(messages.deleteUnitConfirm, {
    unitName: <b>{displayName}</b>,
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
      if (sidebarItemInfo?.id === containerId) {
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
  }, [sidebarItemInfo, showToast, deleteContainerMutation]);

  if (!isOpen || isLoading || isError) {
    return null;
  }

  return (
    <DeleteModal
      isOpen
      close={close}
      variant="warning"
      title={messageMap?.title}
      icon={Warning}
      description={deleteText}
      onDeleteSubmit={onDelete}
    />
  );
};

export default ContainerDeleter;
