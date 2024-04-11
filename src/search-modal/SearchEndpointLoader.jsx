/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { ModalDialog } from '@openedx/paragon';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../generic/Loading';
import { useContentSearch } from './data/apiHooks';
import SearchUI from './SearchUI';
import messages from './messages';

/** @type {React.FC<{courseId: string, closeSearch?: () => void}>} */
const SearchEndpointLoader = ({ courseId, closeSearch }) => {
  const intl = useIntl();

  // Load the Meilisearch connection details from the LMS: the URL to use, the index name, and an API key specific
  // to us (to the current user) that allows us to search all content we have permission to view.
  const {
    data: searchEndpointData,
    isLoading,
    error,
  } = useContentSearch();

  const title = intl.formatMessage(messages.title);

  if (searchEndpointData) {
    return <SearchUI {...searchEndpointData} courseId={courseId} closeSearch={closeSearch} />;
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
