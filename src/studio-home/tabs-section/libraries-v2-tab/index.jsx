import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Row, Pagination } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig, getPath } from '@edx/frontend-platform';

import { constructLibraryAuthoringURL } from '../../../utils';
import useListStudioHomeV2Libraries from '../../data/apiHooks';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';

const LibrariesV2Tab = ({
  libraryAuthoringMfeUrl,
  redirectToLibraryAuthoringMfe,
}) => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSelect = (page) => {
    setCurrentPage(page);
  };

  const {
    data,
    isLoading,
    isError,
  } = useListStudioHomeV2Libraries({ page: currentPage });

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const libURL = (id) => (
    libraryAuthoringMfeUrl && redirectToLibraryAuthoringMfe
      ? constructLibraryAuthoringURL(libraryAuthoringMfeUrl, `library/${id}`)
      // Redirection to the placeholder is done in the MFE rather than
      // through the backend i.e. redirection from cms, because this this will probably change,
      // hence why we use the MFE's origin
      : `${window.location.origin}${getPath(getConfig().PUBLIC_PATH)}library/${id}`
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
      <div className="courses-tab-container">
        <div className="d-flex flex-row justify-content-between my-4">
          {/* Temporary div to add spacing. This will be replaced with lib search/filters */}
          <div className="d-flex" />
          <p data-testid="pagination-info">
            {intl.formatMessage(messages.coursesPaginationInfo, {
              length: data.results.length,
              total: data.count,
            })}
          </p>
        </div>

        {
          data.results.map(({
            id, org, slug, title,
          }) => (
            <CardItem
              key={`${org}+${slug}`}
              isLibraries
              displayName={title}
              org={org}
              number={slug}
              url={libURL(id)}
            />
          ))
        }

        {
          data.numPages > 1
          && (
            <Pagination
              className="d-flex justify-content-center"
              paginationLabel="pagination navigation"
              pageCount={data.numPages}
              currentPage={currentPage}
              onPageSelect={handlePageSelect}
            />
          )
        }
      </div>
    )
  );
};

LibrariesV2Tab.propTypes = {
  libraryAuthoringMfeUrl: PropTypes.string.isRequired,
  redirectToLibraryAuthoringMfe: PropTypes.bool.isRequired,
};

export default LibrariesV2Tab;
