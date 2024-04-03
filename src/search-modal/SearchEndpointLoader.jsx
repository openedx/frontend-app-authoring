/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { ModalDialog } from '@openedx/paragon';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQuery } from '@tanstack/react-query';

import messages from './messages';
import { LoadingSpinner } from '../generic/Loading';
import SearchUI from './SearchUI';

/** @type {React.FC<{courseId: string}>} */
const SearchEndpointLoader = ({ courseId }) => {
  const intl = useIntl();

  // Load the Meilisearch connection details from the LMS: the URL to use, the index name, and an API key specific
  // to us (to the current user) that allows us to search all content we have permission to view.
  const {
    data: searchEndpointData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['content_search'],
    queryFn: async () => {
      const url = new URL('api/content_search/v2/studio/', getConfig().STUDIO_BASE_URL).href;
      const response = await getAuthenticatedHttpClient().get(url);
      return {
        url: response.data.url,
        indexName: response.data.index_name,
        apiKey: response.data.api_key,
      };
    },
    staleTime: 60 * 60, // If cache is up to one hour old, no need to re-fetch
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
  });

  const title = intl.formatMessage(messages.title);

  if (searchEndpointData) {
    return <SearchUI {...searchEndpointData} courseId={courseId} />;
  }
  return (
    <>
      <ModalDialog.Header><ModalDialog.Title>{title}</ModalDialog.Title></ModalDialog.Header>
      <ModalDialog.Body className="h-[calc(100vh-200px)]">
        {/* @ts-ignore */}
        {isLoading ? <LoadingSpinner /> : <ErrorAlert isError>{error?.message ?? String(error)}</ErrorAlert>}
      </ModalDialog.Body>
    </>
  );
};

export default SearchEndpointLoader;
