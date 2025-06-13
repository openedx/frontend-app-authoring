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
    switch (containerType) {
      case ContainerType.Section:
        return {
          title: intl.formatMessage(messages.deleteSectionWarningTitle),
          parentCount: 0,
          parentNames: '',
          parentMessage: {},
          // Update below fields when sections are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteSectionCourseMessaage,
        };
      case ContainerType.Subsection:
        return {
          title: intl.formatMessage(messages.deleteSubsectionWarningTitle),
          parentCount: containerData?.sections?.displayName?.length || 0,
          parentNames: containerData?.sections?.displayName?.join(', '),
          parentMessage: messages.deleteSubsectionParentMessage,
          // Update below fields when subsections are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteSubsectionCourseMessaage,
        };
      default:
        return {
          title: intl.formatMessage(messages.deleteUnitWarningTitle),
          parentCount: containerData?.subsections?.displayName?.length || 0,
          parentNames: containerData?.subsections?.displayName?.join(', '),
          parentMessage: messages.deleteUnitParentMessage,
          // Update below fields when unit are linked to courses
          courseCount: downstreamCount,
          courseMessage: messages.deleteUnitCourseMessage,
        };
    }
  }, [containerId, displayName, containerData]);

  const deleteText = intl.formatMessage(messages.deleteUnitConfirm, {
    unitName: <b>{displayName}</b>,
    message: (
      <div className="text-danger-900">
        {messageMap.parentCount > 0 && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2" src={Error} />
            <span>
              {intl.formatMessage(messageMap.parentMessage, {
                parentNames: <b>{messageMap.parentNames}</b>,
                parentCount: messageMap.parentCount,
              })}
            </span>
          </div>
        )}
        {(messageMap.courseCount || 0) > 0 && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2" src={School} />
            <span>
              {intl.formatMessage(messageMap.courseMessage, {
                courseCount: <b>{messageMap.courseCount}</b>,
                parentCount: messageMap.parentCount,
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
