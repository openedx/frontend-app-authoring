import React, { useState } from 'react';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Error } from '@openedx/paragon/icons';

import { useContentLibraryV2List } from '../../../library-authoring';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';
import LibrariesV2Filters from './libraries-v2-filters';

type Props = Record<never, never>;

const LibrariesV2Tab: React.FC<Props> = () => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({});

  const isFiltered = Object.keys(filterParams).length > 0;

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilterParams({});
    setCurrentPage(1);
  };

  const {
    data,
    isLoading,
    isError,
  } = useContentLibraryV2List({ page: currentPage, ...filterParams });

  if (isLoading && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const hasV2Libraries = !isLoading && !isError && ((data!.results.length || 0) > 0);

  // TODO: update this link when tutorial is ready.
  const librariesTutorialLink = (
    <Alert.Link href="https://docs.openedx.org">
      {intl.formatMessage(messages.librariesV2TabBetaTutorialLinkText)}
    </Alert.Link>
  );

  return (
    <>
      <Alert variant="info">
        {intl.formatMessage(
          messages.librariesV2TabBetaText,
          { link: librariesTutorialLink },
        )}
      </Alert>

      {isError ? (
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
        <div className="courses-tab-container">
          <div className="d-flex flex-row justify-content-between my-4">
            <LibrariesV2Filters
              isLoading={isLoading}
              isFiltered={isFiltered}
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              setCurrentPage={setCurrentPage}
            />
            {!isLoading && !isError
            && (
              <p>
                {intl.formatMessage(messages.coursesPaginationInfo, {
                  length: data!.results.length,
                  total: data!.count,
                })}
              </p>
            )}
          </div>

          { hasV2Libraries
            ? data!.results.map(({
              id, org, slug, title,
            }) => (
              <CardItem
                key={`${org}+${slug}`}
                isLibraries
                displayName={title}
                org={org}
                number={slug}
                path={`/library/${id}`}
              />
            )) : isFiltered && !isLoading && (
              <Alert className="mt-4">
                <Alert.Heading>
                  {intl.formatMessage(messages.librariesV2TabLibraryNotFoundAlertTitle)}
                </Alert.Heading>
                <p>
                  {intl.formatMessage(messages.librariesV2TabLibraryNotFoundAlertMessage)}
                </p>
                <Button variant="primary" onClick={handleClearFilters}>
                  {intl.formatMessage(messages.coursesTabCourseNotFoundAlertCleanFiltersButton)}
                </Button>
              </Alert>
            )}

          {
            hasV2Libraries && (data!.numPages || 0) > 1
            && (
              <Pagination
                className="d-flex justify-content-center"
                paginationLabel="pagination navigation"
                pageCount={data!.numPages}
                currentPage={currentPage}
                onPageSelect={handlePageSelect}
              />
            )
          }
        </div>
      )}
    </>
  );
};

export default LibrariesV2Tab;
