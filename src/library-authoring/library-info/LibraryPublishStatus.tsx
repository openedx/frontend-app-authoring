import React, { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ToastContext } from '../../generic/toast-context';
import StatusWidget from '../generic/status-widget';
import { useCommitLibraryChanges, useRevertLibraryChanges } from '../data/apiHooks';
import { ContentLibrary } from '../data/api';
import messages from './messages';

type LibraryPublishStatusProps = {
  library: ContentLibrary,
};

const LibraryPublishStatus = ({ library } : LibraryPublishStatusProps) => {
  const intl = useIntl();
  const commitLibraryChanges = useCommitLibraryChanges();
  const revertLibraryChanges = useRevertLibraryChanges();
  const { showToast } = useContext(ToastContext);

  const commit = useCallback(() => {
    commitLibraryChanges.mutateAsync(library.id)
      .then(() => {
        showToast(intl.formatMessage(messages.publishSuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.publishErrorMsg));
      });
  }, []);

  const revert = useCallback(() => {
    revertLibraryChanges.mutateAsync(library.id)
      .then(() => {
        showToast(intl.formatMessage(messages.revertSuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.revertErrorMsg));
      });
  }, []);

  return (
    <StatusWidget
      {...library}
      onCommit={library.canEditLibrary ? commit : undefined}
      onRevert={library.canEditLibrary ? revert : undefined}
    />
  );
};

export default LibraryPublishStatus;
