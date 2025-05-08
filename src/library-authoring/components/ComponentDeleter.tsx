import React, { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { School, Warning, Info } from '@openedx/paragon/icons';

import { useSidebarContext } from '../common/context/SidebarContext';
import {
  useComponentsFromSearchIndex,
  useDeleteLibraryBlock,
  useLibraryBlockMetadata,
  useRestoreLibraryBlock,
} from '../data/apiHooks';
import messages from './messages';
import { ToastContext } from '../../generic/toast-context';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { type ContentHit } from '../../search-manager';

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

  const { hits } = useComponentsFromSearchIndex([usageKey]);
  const componentHit = (hits as ContentHit[])?.[0];

  if (!props.isConfirmingDelete) {
    return null;
  }

  let unitsMessage;
  const unitsLength = componentHit?.units?.displayName?.length ?? 0;
  if (unitsLength === 1) {
    unitsMessage = componentHit?.units?.displayName?.[0];
  } else if (unitsLength > 1) {
    unitsMessage = `${unitsLength} units`;
  }

  const deleteText = intl.formatMessage(messages.deleteComponentConfirm, {
    componentName: <b><BlockName usageKey={usageKey} /></b>,
    message: (
      <>
        <div className="d-flex mt-2">
          <Icon className="mr-2" src={School} />
          {unitsMessage
            ? intl.formatMessage(messages.deleteComponentConfirmCourseSmall)
            : intl.formatMessage(messages.deleteComponentConfirmCourse)}
        </div>
        {unitsMessage && (
          <div className="d-flex mt-3 small text-danger-900">
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
