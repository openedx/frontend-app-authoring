/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import {
  Dropzone,
} from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage, FormattedNumber, useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../generic/Loading';
import { useLibraryContext } from '../common/context';
import { getXBlockAssetsApiUrl } from '../data/api';
import { useInvalidateXBlockAssets, useXBlockAssets } from '../data/apiHooks';
import messages from './messages';

export const ComponentAdvancedAssets: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const { readOnly, sidebarComponentInfo } = useLibraryContext();

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen in production
  if (!usageKey) {
    throw new Error('sidebarComponentUsageKey is required to render ComponentAdvancedAssets');
  }

  const { data: assets, isLoading: areAssetsLoading } = useXBlockAssets(usageKey);
  const refreshAssets = useInvalidateXBlockAssets(usageKey);

  const handleProcessUpload = React.useCallback(async ({
    fileData, requestConfig, handleError,
  }: { fileData: FormData, requestConfig: any, handleError: any }) => {
    const uploadData = new FormData();
    const file = fileData.get('file') as File;
    uploadData.set('content', file); // Paragon calls this 'file' but our API needs it called 'content'
    // TODO: make the filename unique if is already exists in assets list, to avoid overwriting.
    const uploadUrl = getXBlockAssetsApiUrl(usageKey) + encodeURI(file.name);
    const client = getAuthenticatedHttpClient();
    try {
      await client.put(uploadUrl, uploadData, requestConfig);
    } catch (error) {
      handleError(error);
      return;
    }
    refreshAssets();
  }, [usageKey]);

  return (
    <>
      <ul>
        { areAssetsLoading ? <li><LoadingSpinner /></li> : null }
        { assets?.map(a => (
          <li key={a.path}>
            <a href={a.url}>{a.path}</a>{' '}
            (<FormattedNumber value={a.size} notation="compact" unit="byte" unitDisplay="narrow" />)
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
    </>
  );
};
