import React, { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { CalendarViewDay, School, Warning } from '@openedx/paragon/icons';

import { useSidebarContext } from '../common/context/SidebarContext';
import { useDeleteLibraryBlock, useLibraryBlockMetadata, useRestoreLibraryBlock } from '../data/apiHooks';
import messages from './messages';
import { ToastContext } from '../../generic/toast-context';
import DeleteModal from '../../generic/delete-modal/DeleteModal';

/**
 * Helper component to load and display the name of the block.
 *
 * This needs to be a separate component so that we only query the metadata of
 * the block when needed (when this is displayed), not on every card shown in
 * the search results.
 */
const BlockName = (props: { usageKey: string }) => {
  const { data: blockMetadata } = useLibraryBlockMetadata(props.usageKey);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{blockMetadata?.displayName}</> ?? <FormattedMessage {...messages.deleteComponentNamePlaceholder} />;
};

interface Props {
  usageKey: string;
  /** If true, show a confirmation modal that asks the user if they want to delete this component. */
  isConfirmingDelete: boolean;
  cancelDelete: () => void;
}

const ComponentDeleter = ({ usageKey, ...props }: Props) => {
  const intl = useIntl();
  const { sidebarComponentInfo, closeLibrarySidebar } = useSidebarContext();
  const { showToast } = useContext(ToastContext);
  const sidebarComponentUsageKey = sidebarComponentInfo?.id;

  const restoreComponentMutation = useRestoreLibraryBlock();
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
    props.cancelDelete();
    // Close the sidebar if it's still open showing the deleted component:
    if (usageKey === sidebarComponentUsageKey) {
      closeLibrarySidebar();
    }
  }, [usageKey, sidebarComponentUsageKey, closeLibrarySidebar]);

  if (!props.isConfirmingDelete) {
    return null;
  }

  const deleteText = intl.formatMessage(messages.deleteComponentConfirm, {
    componentName: <b><BlockName usageKey={usageKey} /></b>,
    message: (
      <>
        <div className="d-flex mt-2">
          <Icon className="mr-2" src={School} />
          {intl.formatMessage(messages.deleteComponentConfirmMsg1)}
        </div>
        <div className="d-flex mt-2">
          <Icon className="mr-2" src={CalendarViewDay} />
          {intl.formatMessage(messages.deleteComponentConfirmMsg2)}
        </div>
      </>
    ),
  });

  return (
    <DeleteModal
      isOpen
      close={props.cancelDelete}
      variant="warning"
      title={intl.formatMessage(messages.deleteComponentWarningTitle)}
      icon={Warning}
      description={deleteText}
      onDeleteSubmit={doDelete}
    />
  );
};

export default ComponentDeleter;
