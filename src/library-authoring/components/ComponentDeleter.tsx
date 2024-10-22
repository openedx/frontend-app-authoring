import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  AlertModal,
  Button,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';

import { useLibraryContext } from '../common/context';
import { useDeleteLibraryBlock, useLibraryBlockMetadata } from '../data/apiHooks';
import messages from './messages';

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
  const {
    sidebarComponentInfo,
    closeLibrarySidebar,
  } = useLibraryContext();
  const sidebarComponentUsageKey = sidebarComponentInfo?.id;

  const deleteComponentMutation = useDeleteLibraryBlock();
  const doDelete = React.useCallback(() => {
    deleteComponentMutation.mutateAsync({ usageKey });
    props.cancelDelete();
    // Close the sidebar if it's still open showing the deleted component:
    if (usageKey === sidebarComponentUsageKey) {
      closeLibrarySidebar();
    }
  }, [usageKey, sidebarComponentUsageKey, closeLibrarySidebar]);

  if (!props.isConfirmingDelete) {
    return null;
  }

  return (
    <AlertModal
      title={intl.formatMessage(messages.deleteComponentWarningTitle)}
      isOpen
      onClose={props.cancelDelete}
      variant="warning"
      icon={Warning}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={props.cancelDelete}><FormattedMessage {...messages.deleteComponentCancelButton} /></Button>
          <Button variant="danger" onClick={doDelete}><FormattedMessage {...messages.deleteComponentButton} /></Button>
        </ActionRow>
      )}
    >
      <p>
        <FormattedMessage
          {...messages.deleteComponentConfirm}
          values={{
            componentName: (
              <strong><BlockName usageKey={usageKey} /></strong>
            ),
          }}
        />
      </p>
    </AlertModal>
  );
};

export default ComponentDeleter;
