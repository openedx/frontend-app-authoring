import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig, getPath } from '@edx/frontend-platform';
import { Error } from '@openedx/paragon/icons';

import { constructLibraryAuthoringURL } from '../../../utils';
import useListStudioHomeV2Libraries from '../../data/apiHooks';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';
import LibrariesV2Filters from './libraries-v2-filters';

const LibrariesV2Tab = ({
  libraryAuthoringMfeUrl,
  redirectToLibraryAuthoringMfe,
}) => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterParams, setFilterParams] = useState({});

  const handlePageSelect = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilterParams({});
    setCurrentPage(1);
    setIsFiltered(false);
  };

  const {
    data,
    isLoading,
    isError,
  } = useListStudioHomeV2Libraries({ page: currentPage, ...filterParams });

  if (isLoading && !isFiltered) {
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

  const hasV2Libraries = (data?.results?.length || 0) > 0;

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
          <LibrariesV2Filters
            isLoading={isLoading}
            setIsFiltered={setIsFiltered}
            isFiltered={isFiltered}
            setFilterParams={setFilterParams}
            setCurrentPage={setCurrentPage}
          />
          { !isLoading
          && (
            <p data-testid="pagination-info">
              {intl.formatMessage(messages.coursesPaginationInfo, {
                length: data.results.length,
                total: data.count,
              })}
            </p>
          )}
        </div>

        { hasV2Libraries
          ? data?.results.map(({
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
          )) : isFiltered && !isLoading && (
            <Alert className="mt-4">
              <Alert.Heading>
                {intl.formatMessage(messages.librariesV2TabLibraryNotFoundAlertTitle)}
              </Alert.Heading>
              <p data-testid="courses-not-found-alert">
                {intl.formatMessage(messages.librariesV2TabLibraryNotFoundAlertMessage)}
              </p>
              <Button variant="primary" onClick={handleClearFilters}>
                {intl.formatMessage(messages.coursesTabCourseNotFoundAlertCleanFiltersButton)}
              </Button>
            </Alert>
          )}

        {
          (data?.numPages || 0) > 1
          && (
            <Pagination
              className="d-flex justify-content-center"
              paginationLabel="pagination navigation"
              pageCount={data?.numPages}
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
