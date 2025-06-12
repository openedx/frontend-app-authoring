/* eslint-disable react/prop-types */
import AlertMessage from 'generic/alert-message';
// import React from 'react';
// import CardItem from 'studio-home/card-item';
import {
  Alert, Button, Icon, Pagination, Row,
} from '@openedx/paragon';
import { Add, Error } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import LibrariesV2Filters from './libraries-v2-filters';
import messages from '../messages';
import LibraryCard from './LibraryCard';

const CustomLibrariesV2 = ({
  isError,
  isLoading,
  isFiltered,
  filterParams,
  setFilterParams,
  setCurrentPage,
  data,
  intl,
  hasV2Libraries,
  handleClearFilters,
  handlePageSelect,
  currentPage,
}) => {
  const navigate = useNavigate();
  const handleNewLibrary = () => {
    navigate('/library/create');
  };
  return (
    <div className="custom-libraries-container">
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
        <div className="libraries-tab-container">
          <div className="d-flex flex-row justify-content-between align-items-center my-2 mb-4">
            <div className="my-courses-title">Content Libraries</div>
            <div className="d-flex flex-row gap-3 libraries-header-filters-container">
              <LibrariesV2Filters
                isLoading={isLoading}
                isFiltered={isFiltered}
                filterParams={filterParams}
                setFilterParams={setFilterParams}
                setCurrentPage={setCurrentPage}
              />
              <Button variant="primary" iconBefore={Add} size="sm" onClick={handleNewLibrary}>
                New Library
              </Button>
            </div>
          </div>

          { hasV2Libraries
            ? (
              <div className="library-cards-grid">
                {data!.results.map(({
                  id, org, slug, title,
                }) => (
                  <LibraryCard
                    key={`${org}+${slug}`}
                    title={title}
                    org={org}
                    id={slug}
                    path={`/library/${id}`}
                  />
                ))}
              </div>
            ) : isFiltered && !isLoading && (
              <Alert className="mt-4 alert-message-container">
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
                className="d-flex justify-content-end"
                paginationLabel="pagination navigation"
                pageCount={data!.numPages}
                currentPage={currentPage}
                onPageSelect={handlePageSelect}
              />
            )
          }
        </div>
      )}
    </div>
  );
};

export default CustomLibrariesV2;
