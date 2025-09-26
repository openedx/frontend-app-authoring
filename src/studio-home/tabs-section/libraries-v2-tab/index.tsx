import React, { useState } from 'react';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Error } from '@openedx/paragon/icons';

import { useContentLibraryV2List } from '@src/library-authoring';
import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import CardItem from '../../card-item';
import messages from '../messages';
import LibrariesV2Filters from './libraries-v2-filters';
import { WelcomeLibrariesV2Alert } from './WelcomeLibrariesV2Alert';

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
    isPending,
    isError,
  } = useContentLibraryV2List({ page: currentPage, ...filterParams });

  if (isPending && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const hasV2Libraries = !isPending && !isError && ((data!.results.length || 0) > 0);

  return (
    <>
      {getConfig().ENABLE_LEGACY_LIBRARY_MIGRATOR === 'true' && (<WelcomeLibrariesV2Alert />)}

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
              isPending={isPending}
              isFiltered={isFiltered}
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              setCurrentPage={setCurrentPage}
            />
            {!isPending && !isError
              && (
                <p>
                  {intl.formatMessage(messages.coursesPaginationInfo, {
                    length: data.results.length,
                    total: data.count,
                  })}
                </p>
              )}
          </div>

          {hasV2Libraries
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
            )) : isFiltered && !isPending && (
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
