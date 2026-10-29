import { useIntl } from '@edx/frontend-platform/i18n';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

import AlertMessage from '@src/generic/alert-message';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { useCompetencyAssociations } from '@src/taxonomy/competency-management/CompetencyAssociationsContext';
import messages from './messages';
import { describeRemoval } from './utils';

/** Confirms removals on the Competency Management page, driven by the provider's `pendingRemoval`.
 * A failed request keeps the dialog open with an alert, and Remove retries. The wording doesn't say
 * deleted vs. archived, since the page ignores the delete endpoints' `archived` flag.
 */
const RemovalConfirmationModal = () => {
  const intl = useIntl();
  const {
    pendingRemoval,
    confirmRemoval,
    cancelRemoval,
    competencyName,
  } = useCompetencyAssociations();

  if (!pendingRemoval) {
    return null;
  }

  const { summary, failure } = pendingRemoval;
  const { title, failedTitle, details } = describeRemoval(intl, summary, competencyName);

  return (
    <DeleteModal
      isOpen
      close={cancelRemoval}
      onDeleteSubmit={confirmRemoval}
      btnLabel={intl.formatMessage(messages.removeDialogButton)}
      title={title}
      description={
        <>
          {failure && (
            <AlertMessage
              variant="danger"
              icon={ErrorIcon}
              title={failedTitle}
              description={intl.formatMessage(
                failure === 'partly-removed' ? messages.partlyRemovedMessage : messages.nothingRemovedMessage,
              )}
            />
          )}
          {details && <p>{details}</p>}
          <p className="mb-0">{intl.formatMessage(messages.removalCannotBeUndoneMessage)}</p>
        </>
      }
    />
  );
};

export default RemovalConfirmationModal;
