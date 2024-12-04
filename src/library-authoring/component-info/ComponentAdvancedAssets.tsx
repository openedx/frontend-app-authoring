/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Button,
  Dropzone,
} from '@openedx/paragon';
import { Delete } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage, FormattedNumber, useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../generic/Loading';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { getXBlockAssetsApiUrl } from '../data/api';
import { useDeleteXBlockAsset, useInvalidateXBlockAssets, useXBlockAssets } from '../data/apiHooks';
import messages from './messages';

export const ComponentAdvancedAssets: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const { readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen in production
  if (!usageKey) {
    throw new Error('sidebarComponentUsageKey is required to render ComponentAdvancedAssets');
  }

  // For listing assets:
  const { data: assets, isLoading: areAssetsLoading } = useXBlockAssets(usageKey);
  const refreshAssets = useInvalidateXBlockAssets(usageKey);

  // For uploading assets:
  const handleProcessUpload = React.useCallback(async ({
    fileData, requestConfig, handleError,
  }: { fileData: FormData, requestConfig: any, handleError: any }) => {
    const uploadData = new FormData();
    const file = fileData.get('file') as File;
    uploadData.set('content', file); // Paragon calls this 'file' but our API needs it called 'content'
    // TODO: We may wish to warn the user (and prompt to confirm?) if they are
    // about to overwite an existing file by uploading a file with the same
    // name as an existing file. That is a workflow we want to support, but only
    // if it's intentional.
    // Note: we follow the convention that files meant to be seen/downloaded by
    // learners should be prefixed with 'static/'
    const uploadUrl = `${getXBlockAssetsApiUrl(usageKey)}static/${encodeURI(file.name)}`;
    const client = getAuthenticatedHttpClient();
    try {
      await client.put(uploadUrl, uploadData, requestConfig);
    } catch (error) {
      handleError(error);
      return;
    }
    refreshAssets();
  }, [usageKey]);

  // For deleting assets:
  const deleter = useDeleteXBlockAsset(usageKey);
  const [filePathToDelete, setConfirmDeleteAsset] = React.useState<string>('');
  const deleteFile = React.useCallback(() => {
    deleter.mutateAsync(filePathToDelete); // Don't wait for this before clearing the modal on the next line
    setConfirmDeleteAsset('');
  }, [filePathToDelete, usageKey]);

  return (
    <>
      <ul>
        { areAssetsLoading ? <li><LoadingSpinner /></li> : null }
        { assets?.map(a => (
          <li key={a.path}>
            <a href={a.url}>{a.path}</a>{' '}
            (<FormattedNumber value={a.size} notation="compact" unit="byte" unitDisplay="narrow" />)
            <Button variant="link" size="sm" iconBefore={Delete} onClick={() => { setConfirmDeleteAsset(a.path); }} title={intl.formatMessage(messages.advancedDetailsAssetsDeleteButton)}>
              <span className="sr-only"><FormattedMessage {...messages.advancedDetailsAssetsDeleteButton} /></span>
            </Button>
          </li>
        )) }
      </ul>
      { assets !== undefined && !readOnly // Wait until assets have loaded before displaying add button:
        ? (
          <Dropzone
            style={{ height: '200px' }}
            onProcessUpload={handleProcessUpload}
            onUploadProgress={() => {}}
          />
        )
        : null }

      <DeleteModal
        isOpen={filePathToDelete !== ''}
        close={() => { setConfirmDeleteAsset(''); }}
        variant="warning"
        title={intl.formatMessage(messages.advancedDetailsAssetsDeleteFileTitle)}
        description={`Are you sure you want to delete ${filePathToDelete}?`}
        onDeleteSubmit={deleteFile}
      />
    </>
  );
};
