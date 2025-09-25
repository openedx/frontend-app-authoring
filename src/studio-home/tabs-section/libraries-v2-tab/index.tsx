import React, { useCallback, useState } from 'react';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
  Form,
  Stack,
  useToggle,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add, Error } from '@openedx/paragon/icons';

import { CreateLibraryModal, useContentLibraryV2List } from '@src/library-authoring';
import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import type { ContentLibrary, LibrariesV2Response } from '@src/library-authoring/data/api';

import CardItem from '../../card-item';
import messages from '../messages';
import LibrariesV2Filters from './libraries-v2-filters';

interface CardListProps {
  hasV2Libraries: boolean;
  selectMode?: 'single' | 'multiple' | null;
  isFiltered: boolean;
  isLoading: boolean;
  data: LibrariesV2Response;
  handleClearFilters: () => void;
}

const CardList: React.FC<CardListProps> = ({
  hasV2Libraries,
  selectMode,
  isFiltered,
  isLoading,
  data,
  handleClearFilters,
}) => {
  const intl = useIntl();

  if (hasV2Libraries) {
    return (
      <>
        {
          data!.results.map(({
            id, org, slug, title,
          }) => (
            <CardItem
              key={`${org}+${slug}`}
              isLibraries
              displayName={title}
              org={org}
              number={slug}
              path={`/library/${id}`}
              selectMode={selectMode}
              itemId={id}
            />
          ))
        }
      </>
    );
  }

  // Empty alert
  if (isFiltered && !isLoading) {
    return (
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
    );
  }
  return null;
};

interface Props {
  selectedLibraryId?: string | null;
  handleSelect?: ((library: ContentLibrary) => void) | null;
  showCreateLibrary?: boolean;
}

const LibrariesV2List: React.FC<Props> = ({
  selectedLibraryId = null,
  handleSelect = null,
  showCreateLibrary = false,
}) => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({});
  const [isCreateLibraryOpen, openCreateLibrary, closeCreateLibrary] = useToggle(false);

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
    isPending,
    isError,
  } = useContentLibraryV2List({ page: currentPage, ...filterParams });

  const handlePostCreateLibrary = useCallback((library: ContentLibrary) => {
    if (handleSelect) {
      handleSelect(library);
      closeCreateLibrary();
    }
  }, [handleSelect, closeCreateLibrary]);

  const handleOnChangeRadioSet = useCallback((libraryId: string) => {
    if (handleSelect && data) {
      const library = data.results.find((item) => item.id === libraryId);
      if (library) {
        handleSelect(library);
      }
    }
  }, [data, handleSelect]);

  if (isPending && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const hasV2Libraries = !isPending && !isError && ((data!.results.length || 0) > 0);

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
          <Stack direction="horizontal">
            {showCreateLibrary && (
              <Button
                variant="outline-primary"
                onClick={openCreateLibrary}
                iconBefore={Add}
                className="mr-3"
              >
                {intl.formatMessage(messages.createLibraryButton)}
              </Button>
            )}
            <LibrariesV2Filters
              isPending={isPending}
              isFiltered={isFiltered}
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              setCurrentPage={setCurrentPage}
            />
          </Stack>
          {!isPending && !isError
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
            onChange={(e) => handleOnChangeRadioSet(e.target.value)}
          >
            <CardList
              hasV2Libraries={hasV2Libraries}
              selectMode={inSelectMode ? 'single' : null}
              isFiltered={isFiltered}
              isLoading={isPending}
              data={data!}
              handleClearFilters={handleClearFilters}
            />
          </Form.RadioSet>
        ) : (
          <CardList
            hasV2Libraries={hasV2Libraries}
            selectMode={inSelectMode ? 'single' : null}
            isFiltered={isFiltered}
            isLoading={isPending}
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
        <CreateLibraryModal
          isOpen={isCreateLibraryOpen}
          onClose={closeCreateLibrary}
          handlePostCreate={handlePostCreateLibrary}
        />
      </div>
    )
  );
};

export default LibrariesV2List;
