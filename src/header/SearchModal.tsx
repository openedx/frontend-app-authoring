import React from 'react';
import {
  ModalDialog,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useQuery } from '@tanstack/react-query';

import messages from './messages';
import { LoadingSpinner } from '../generic/Loading';
import SearchUI from './SearchUI';

interface Props {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}


const SearchModal: React.FC<Props> = ({courseId, ...props}) => {
  const intl = useIntl();

  const {
    data: searchEndpointData,
    isLoading
  } = useQuery({
    queryKey: ['content_search'],
    queryFn: async () => {
      const url = new URL('api/content_search/v2/studio/', getConfig().STUDIO_BASE_URL).href;
      const response = await getAuthenticatedHttpClient().get(url);
      return {
        url: response.data.url as string,
        indexName: response.data.index_name as string,
        apiKey: response.data.api_key as string,
      };
    },
    staleTime: 60 * 60,  // If cache is up to one hour old, no need to re-fetch
    refetchOnWindowFocus: false,  // This doesn't need to be refreshed when the user switches back to this tab.
  });

  return (
    <ModalDialog
      title={intl.formatMessage(messages.courseSearchTitle)}
      size="xl"
      isOpen={props.isOpen}
      onClose={props.onClose}
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{intl.formatMessage(messages.courseSearchTitle)}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {
          searchEndpointData ? <>
            <SearchUI {...searchEndpointData} />
          </>
          : (isLoading ? <LoadingSpinner /> : <>Error</>)
        }
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SearchModal;
