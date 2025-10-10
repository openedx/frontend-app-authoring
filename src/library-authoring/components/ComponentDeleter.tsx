import React, { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { School, Delete, Info } from '@openedx/paragon/icons';

import { useEntityLinks } from '@src/course-libraries/data/apiHooks';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ToastContext } from '@src/generic/toast-context';
import { type ContentHit } from '@src/search-manager';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  useContentFromSearchIndex,
  useDeleteLibraryBlock,
  useRestoreLibraryBlock,
} from '../data/apiHooks';
import messages from './messages';

interface Props {
  usageKey: string;
  close: () => void;
}

const ComponentDeleter = ({ usageKey, close }: Props) => {
  const intl = useIntl();
  const { sidebarItemInfo, closeLibrarySidebar } = useSidebarContext();
  const { showToast } = useContext(ToastContext);
  const { containerId: currentUnitId } = useLibraryContext();
  const sidebarComponentUsageKey = sidebarItemInfo?.id;

  const restoreComponentMutation = useRestoreLibraryBlock();
  const { data: dataDownstreamLinks, isPending: isPendingLinks } = useEntityLinks({ upstreamKey: usageKey, contentType: 'components' });
  const downstreamCount = dataDownstreamLinks?.length ?? 0;

  const restoreComponent = useCallback(async () => {
    try {
      await restoreComponentMutation.mutateAsync({ usageKey });
      showToast(intl.formatMessage(messages.undoDeleteComponentToastSuccess));
    } catch (e) {
      showToast(intl.formatMessage(messages.undoDeleteComponentToastFailed));
    }
  }, []);

  const deleteComponentMutation = useDeleteLibraryBlock();
  const doDelete = React.useCallback(async () => {
    await deleteComponentMutation.mutateAsync({ usageKey });
    showToast(
      intl.formatMessage(messages.deleteComponentSuccess),
      {
        label: intl.formatMessage(messages.undoDeleteCollectionToastAction),
        onClick: restoreComponent,
      },
    );
    close();
    // Close the sidebar if it's still open showing the deleted component:
    if (usageKey === sidebarComponentUsageKey) {
      closeLibrarySidebar();
    }
  }, [usageKey, sidebarComponentUsageKey, closeLibrarySidebar]);

  const { hits, isPending } = useContentFromSearchIndex([usageKey]);
  const componentHit = (hits as ContentHit[])?.[0];

  // istanbul ignore if: loading state
  if (isPending || isPendingLinks) {
    // Only render the modal after loading
    return null;
  }

  const currentUnitIndex = componentHit?.units?.key?.findIndex((id) => id === currentUnitId);
  const otherUnits = componentHit?.units?.displayName?.filter(
    (_, index) => index !== currentUnitIndex,
  );
  let unitsMessage: string | undefined;
  const otherUnitsLength = otherUnits?.length ?? 0;
  if (otherUnitsLength === 1) {
    unitsMessage = otherUnits?.[0];
  } else if (otherUnitsLength > 1) {
    unitsMessage = `${otherUnitsLength} Units`;
  }

  const deleteText = intl.formatMessage(messages.deleteComponentConfirm, {
    componentName: <b>{componentHit?.displayName}</b>,
    message: (
      <div className="text-danger-900">
        {unitsMessage && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2 mt-2" src={Info} />
            <div>
              <FormattedMessage
                {...messages.deleteComponentConfirmUnits}
                values={{
                  unit: <strong>{unitsMessage}</strong>,
                }}
              />
            </div>
          </div>
        )}
        {(downstreamCount || 0) > 0 && (
          <div className="d-flex align-items-center mt-2">
            <Icon className="mr-2" src={School} />
            <span>
              {intl.formatMessage(messages.deleteComponentConfirmCourse, {
                courseCount: downstreamCount,
                courseCountText: <b>{downstreamCount}</b>,
              })}
            </span>
          </div>
        )}
      </div>
    ),
  });

  return (
    <DeleteModal
      isOpen
      close={close}
      variant="danger"
      title={intl.formatMessage(messages.deleteComponentWarningTitle)}
      icon={Delete}
      description={deleteText}
      onDeleteSubmit={doDelete}
    />
  );
};

export default ComponentDeleter;
