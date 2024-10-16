import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import StatusWidget from '../generic/status-widget';
import messages from './messages';

const LibraryPublishStatus = () => {
  const intl = useIntl();
  const { libraryData, readOnly } = useLibraryContext();

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
      revertLibraryChanges.mutateAsync(libraryData.id)
        .then(() => {
          showToast(intl.formatMessage(messages.revertSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.revertErrorMsg));
        });
    }
  }, [libraryData]);

  if (!libraryData) {
    return null;
  }

  return (
    <StatusWidget
      {...libraryData}
      onCommit={!readOnly ? commit : undefined}
      onRevert={!readOnly ? revert : undefined}
    />
  );
};

export default LibraryPublishStatus;
