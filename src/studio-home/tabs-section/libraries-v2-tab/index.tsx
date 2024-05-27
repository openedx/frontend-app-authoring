import React from 'react';
import { Icon, Row } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useListStudioHomeV2Libraries } from '../../data/apiHooks';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';

const LibrariesV2Tab = () => {
  const intl = useIntl();
  const {
    data,
    isLoading,
    isError,
  } = useListStudioHomeV2Libraries();

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    isError ? (
      <AlertMessage
        title={intl.formatMessage(messages.librariesTabErrorMessage)}
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span>{intl.formatMessage(messages.librariesTabErrorMessage)}</span>
          </Row>
        )}
      />
    ) : (
      <div className="courses-tab">
        {data.map(({ org, slug, title }) => (
          <CardItem
            key={`${org}+${slug}`}
            isLibraries
            displayName={title}
            org={org}
            number={slug}
            // TODO: Pass in the URL
            // url={url}
          />
        ))}
      </div>
    )
  );
};


export default LibrariesV2Tab;
