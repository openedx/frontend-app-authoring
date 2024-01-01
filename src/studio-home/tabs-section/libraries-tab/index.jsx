import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, Row } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { LoadingSpinner } from '../../../generic/Loading';
import CardItem from '../../card-item';
import { sortAlphabeticallyArray } from '../utils';
import AlertMessage from '../../../generic/alert-message';
import messages from '../messages';

const LibrariesTab = ({
  libraries,
  isLoading,
  isFailed,
  // injected
  intl,
}) => {
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
    )
  );
};
LibrariesTab.propTypes = {
  libraries: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      libraryKey: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      org: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isFailed: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(LibrariesTab);
