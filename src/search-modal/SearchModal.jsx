/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  ModalDialog,
} from '@openedx/paragon';
import { ErrorAlert } from '@edx/frontend-lib-content-components';
import { useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../generic/Loading';
import SearchUI from './SearchUI';
import { useContentSearch } from './data/apiHooks';
import messages from './messages';

// Using TypeScript here is blocked until we have frontend-build 14:
// interface Props {
//   courseId: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

/** @type {React.FC<{courseId: string, isOpen: boolean, onClose: () => void}>} */
const SearchModal = ({ courseId, ...props }) => {
  const intl = useIntl();

  // Load the Meilisearch connection details from the LMS: the URL to use, the index name, and an API key specific
  // to us (to the current user) that allows us to search all content we have permission to view.
  const {
    data: searchEndpointData,
    isLoading,
    error,
  } = useContentSearch();

  const title = intl.formatMessage(messages['courseSearch.title']);
  let body;
  if (searchEndpointData) {
    body = <SearchUI {...searchEndpointData} />;
  } else if (isLoading) {
    body = <LoadingSpinner />;
  } else {
    // @ts-ignore
    body = <ErrorAlert isError>{error?.message ?? String(error)}</ErrorAlert>;
  }

  return (
    <ModalDialog
      title={title}
      size="xl"
      isOpen={props.isOpen}
      onClose={props.onClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header><ModalDialog.Title>{title}</ModalDialog.Title></ModalDialog.Header>
      <ModalDialog.Body>{body}</ModalDialog.Body>
    </ModalDialog>
  );
};

export default SearchModal;
