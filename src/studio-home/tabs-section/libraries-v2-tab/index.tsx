import React, { useState } from 'react';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
  Form,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Error } from '@openedx/paragon/icons';

import { useContentLibraryV2List } from '@src/library-authoring';
import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import type { LibrariesV2Response } from '@src/library-authoring/data/api';

import CardItem from '../../card-item';
import messages from '../messages';
import LibrariesV2Filters from './libraries-v2-filters';

interface CardListProps {
  hasV2Libraries: boolean;
  inSelectMode: boolean;
  isFiltered: boolean;
  isLoading: boolean;
  data: LibrariesV2Response;
  handleClearFilters: () => void;
}

const CardList: React.FC<CardListProps> = ({
  hasV2Libraries,
  inSelectMode,
  isFiltered,
  isLoading,
  data,
  handleClearFilters,
}) => {
  const intl = useIntl();
  return (
    hasV2Libraries
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
          inSelectMode={inSelectMode}
          itemId={id}
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
      )
  );
};

interface Props {
  selectedLibraryId?: string | null;
  handleSelect?: ((libraryId: string) => void) | null;
}

const LibrariesV2List: React.FC<Props> = ({
  selectedLibraryId = null,
  handleSelect = null,
}) => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({});

  const isFiltered = Object.keys(filterParams).length > 0;
  const inSelectMode = handleSelect !== null;

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

  return (
    isError ? (
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

        {inSelectMode ? (
          <Form.RadioSet
            name="select-libraries-v2-list"
            value={selectedLibraryId}
            onChange={(e) => handleSelect?.(e.target.value)}
          >
            <CardList
              hasV2Libraries={hasV2Libraries}
              inSelectMode={inSelectMode}
              isFiltered={isFiltered}
              isLoading={isLoading}
              data={data!}
              handleClearFilters={handleClearFilters}
            />
          </Form.RadioSet>
        ) : (
          <CardList
            hasV2Libraries={hasV2Libraries}
            inSelectMode={inSelectMode}
            isFiltered={isFiltered}
            isLoading={isLoading}
            data={data!}
            handleClearFilters={handleClearFilters}
          />
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
    )
  );
};

export default LibrariesV2List;
