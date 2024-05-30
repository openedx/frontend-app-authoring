import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Row } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useListStudioHomeV2Libraries } from '../../data/apiHooks';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';

const LibrariesV2Tab = ({
  libraryAuthoringMfeUrl,
  redirectToLibraryAuthoringMfe,
}) => {
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

  const libURL = (id: string): string => (
    libraryAuthoringMfeUrl && redirectToLibraryAuthoringMfe
      ? `${libraryAuthoringMfeUrl}library/${id}`
      // Redirection to the placeholder is done in the MFE rather than
      // through the backend i.e. redirection from cms, because this this will probably change
      : `${window.location.origin}/course-authoring/library/${id}`
  );

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
        {data.map(({ id, org, slug, title }) => (
          <CardItem
            key={`${org}+${slug}`}
            isLibraries
            displayName={title}
            org={org}
            number={slug}
            url={libURL(id)}
          />
        ))}
      </div>
    )
  );
};

LibrariesV2Tab.propTypes = {
  libraryAuthoringMfeUrl: PropTypes.string.isRequired,
  redirectToLibraryAuthoringMfe: PropTypes.bool.isRequired,
};

export default LibrariesV2Tab;
