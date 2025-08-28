import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Row } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import CardItem from '../../card-item';
import { sortAlphabeticallyArray } from '../utils';
import messages from '../messages';
import { MigrateLegacyLibrariesAlert } from './MigrateLegacyLibrariesAlert';

interface LibrariesTabProps {
  libraries: {
    displayName: string;
    libraryKey: string;
    number: string;
    org: string;
    url: string;
  }[];
  isLoading: boolean;
  isFailed: boolean;
}

const LibrariesTab = ({
  libraries,
  isLoading,
  isFailed,
}: LibrariesTabProps) => {
  const intl = useIntl();
  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }
  return (
    isFailed ? (
      <AlertMessage
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span>{intl.formatMessage(messages.librariesTabErrorMessage)}</span>
          </Row>
        )}
      />
    ) : (
      <>
        <MigrateLegacyLibrariesAlert />
        <div className="courses-tab">
          {sortAlphabeticallyArray(libraries).map(({
            displayName, org, number, url,
          }) => (
            <CardItem
              key={`${org}+${number}`}
              isLibraries
              displayName={displayName}
              org={org}
              number={number}
              url={url}
            />
          ))}
        </div>
      </>
    )
  );
};

export default LibrariesTab;
