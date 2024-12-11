import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useToggle } from '@openedx/paragon';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import DeleteModal from '../../generic/delete-modal/DeleteModal';

const LibraryPublishStatus = () => {
  const intl = useIntl();
  const { libraryData, readOnly } = useLibraryContext();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);

  const commitLibraryChanges = useCommitLibraryChanges();
  const revertLibraryChanges = useRevertLibraryChanges();
  const { showToast } = useContext(ToastContext);

  const commit = useCallback(() => {
    if (libraryData) {
      commitLibraryChanges.mutateAsync(libraryData.id)
        .then(() => {
          showToast(intl.formatMessage(messages.publishSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.publishErrorMsg));
        });
    }
  }, [libraryData]);

  const revert = useCallback(async () => {
    if (libraryData) {
      try {
        await revertLibraryChanges.mutateAsync(libraryData.id);
        showToast(intl.formatMessage(messages.revertSuccessMsg));
      } catch (e) {
        showToast(intl.formatMessage(messages.revertErrorMsg));
      } finally {
        closeConfirmModal();
      }
    }
  }, [libraryData]);

  if (!libraryData) {
    return null;
  }

  return (
    <>
      <StatusWidget
        {...libraryData}
        onCommit={!readOnly ? commit : undefined}
        onRevert={!readOnly ? openConfirmModal : undefined}
      />
      <DeleteModal
        isOpen={isConfirmModalOpen}
        close={closeConfirmModal}
        variant="warning"
        title={intl.formatMessage(messages.discardChangesTitle)}
        description={intl.formatMessage(messages.discardChangesDescription)}
        onDeleteSubmit={revert}
        btnLabel={intl.formatMessage(messages.discardChangesDefaultBtnLabel)}
      />
    </>
  );
};

export default LibraryPublishStatus;
