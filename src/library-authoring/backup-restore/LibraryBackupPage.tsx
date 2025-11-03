import {
  Alert,
  Button,
  Container,
} from '@openedx/paragon';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Download, Loop, Newsstand } from '@openedx/paragon/icons';
import NotFoundAlert from '@src/generic/NotFoundAlert';
import SubHeader from '@src/generic/sub-header/SubHeader';
import Header from '@src/header';
import { LibraryBackupStatus } from '@src/library-authoring/backup-restore/data/constants';
import { useCreateLibraryBackup, useGetLibraryBackupStatus } from '@src/library-authoring/backup-restore/data/hooks';
import messages from '@src/library-authoring/backup-restore/messages';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { useContentLibrary } from '@src/library-authoring/data/apiHooks';

export const LibraryBackupPage = () => {
  const intl = useIntl();
  const { libraryId, readOnly } = useLibraryContext();
  const [taskId, setTaskId] = useState<string>('');
  const [isMutationInProgress, setIsMutationInProgress] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: libraryData } = useContentLibrary(libraryId);

  const mutation = useCreateLibraryBackup(libraryId);
  const backupStatus = useGetLibraryBackupStatus(libraryId, taskId);

  // Clean up timeout on unmount
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleDownload = useCallback((url: string) => {
    try {
      // Create a temporary anchor element for better download handling
      const link = document.createElement('a');
      link.href = url;
      link.download = `${libraryData?.slug || 'library'}-backup.tar.gz`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Fallback to window.location.href if the above fails
      window.location.href = url;
    }
  }, [libraryData?.slug]);

  const handleDownloadBackup = useCallback(() => {
    // If backup is ready, download it immediately
    if (backupStatus.data?.state === LibraryBackupStatus.Succeeded && backupStatus.data.url) {
      handleDownload(backupStatus.data.url);
      return;
    }

    // If no backup in progress, create a new one
    if (!taskId) {
      setIsMutationInProgress(true);
      mutation.mutate(undefined, {
        onSuccess: (data) => {
          setTaskId(data.task_id);
          // Clear task id after 1 minutes to allow new backups
          timeoutRef.current = setTimeout(() => {
            setTaskId('');
            setIsMutationInProgress(false);
            timeoutRef.current = null;
          }, 60 * 1000);
        },
        onError: () => {
          setIsMutationInProgress(false);
        },
      });
    }
  }, [taskId, backupStatus.data, mutation, handleDownload]);

  // Auto-download when backup becomes ready
  useEffect(() => {
    if (backupStatus.data?.state === LibraryBackupStatus.Succeeded && backupStatus.data.url) {
      handleDownload(backupStatus.data.url);
      setIsMutationInProgress(false);
    }
  }, [backupStatus.data?.state, backupStatus.data?.url, handleDownload]);

  // Reset mutation progress when backup fails
  useEffect(() => {
    if (backupStatus.data?.state === LibraryBackupStatus.Failed) {
      setIsMutationInProgress(false);
    }
  }, [backupStatus.data?.state]);

  const backupState = backupStatus.data?.state;
  const isBackupInProgress = isMutationInProgress || (taskId && (
    backupState === LibraryBackupStatus.Pending
    || backupState === LibraryBackupStatus.Exporting
  ));
  const hasBackupFailed = backupState === LibraryBackupStatus.Failed;
  const hasBackupSucceeded = backupState === LibraryBackupStatus.Succeeded;

  // Show error message for failed mutation
  const mutationError = mutation.error as Error | null;

  if (!libraryData) {
    return <NotFoundAlert />;
  }

  const getButtonText = () => {
    if (isBackupInProgress) {
      if (isMutationInProgress && !backupState) {
        return intl.formatMessage(messages.backupPending);
      }
      return backupState === LibraryBackupStatus.Pending
        ? intl.formatMessage(messages.backupPending) : intl.formatMessage(messages.backupExporting);
    }
    if (hasBackupSucceeded && backupStatus.data?.url) {
      return intl.formatMessage(messages.downloadReadyButton);
    }
    return intl.formatMessage(messages.createBackupButton);
  };

  const getButtonIcon = () => {
    if (isBackupInProgress) {
      return Loop;
    }
    return Download;
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <Helmet>
          <title>{libraryData.title} | {process.env.SITE_NAME}</title>
        </Helmet>
        <Header
          number={libraryData.slug}
          title={libraryData.title}
          org={libraryData.org}
          contextId={libraryId}
          readOnly={readOnly}
          isLibrary
          containerProps={{
            size: undefined,
          }}
        />
        <Container className="px-0 mt-4 mb-5 library-authoring-page bg-white">
          <div className="px-4 bg-light-200 border-bottom mb-2">
            <SubHeader
              title={intl.formatMessage(messages.backupPageTitle)}
              subtitle={intl.formatMessage(messages.backupPageSubtitle)}
              hideBorder
            />
          </div>

          {/* Error Messages */}
          {hasBackupFailed && (
            <div className="px-4">
              <Alert variant="danger">
                {intl.formatMessage(messages.backupFailedError)}
              </Alert>
            </div>
          )}
          {mutationError && (
            <div className="px-4">
              <Alert variant="danger">
                {intl.formatMessage(messages.mutationError, { error: mutationError.message })}
              </Alert>
            </div>
          )}

          <Container className="px-4 py-4">
            <div className="mb-4">
              <p>{intl.formatMessage(messages.backupDescription)}</p>
            </div>

            <div className="bg-info-700 text-white p-4 rounded row justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <div className="d-inline-flex align-items-center">
                  <Newsstand className="mr-2" />
                  <span>{libraryData.title}</span>
                </div>
                <span className="small">{`${libraryData.org} / ${libraryData.slug}`}</span>
              </div>
              <Button
                variant="info"
                iconBefore={getButtonIcon()}
                onClick={handleDownloadBackup}
                disabled={Boolean(isBackupInProgress)}
                aria-label={intl.formatMessage(messages.downloadAriaLabel, {
                  buttonText: getButtonText(),
                  libraryTitle: libraryData.title,
                })}
              >
                {getButtonText()}
              </Button>
            </div>
          </Container>
        </Container>
      </div>
    </div>
  );
};
