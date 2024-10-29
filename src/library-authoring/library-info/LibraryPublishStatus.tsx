import { useCallback, useContext, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useToggle } from '@openedx/paragon';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';
import DeleteModal from '../../generic/delete-modal/DeleteModal';

const LibraryPublishStatus = () => {
  const intl = useIntl();
  const { libraryData, readOnly } = useLibraryContext();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);
  const [confirmBtnState, setConfirmBtnState] = useState('default');

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

  const revert = useCallback(() => {
    if (libraryData) {
      setConfirmBtnState('pending');
      revertLibraryChanges.mutateAsync(libraryData.id)
        .then(() => {
          showToast(intl.formatMessage(messages.revertSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.revertErrorMsg));
        }).finally(() => {
          setConfirmBtnState('default');
          closeConfirmModal();
        });
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
        btnState={confirmBtnState}
        btnDefaultLabel={intl.formatMessage(messages.discardChangesDefaultBtnLabel)}
        btnPendingLabel={intl.formatMessage(messages.discardChangesDefaultBtnLabel)}
      />
    </>
  );
};

export default LibraryPublishStatus;
