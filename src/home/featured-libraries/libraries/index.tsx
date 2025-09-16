import React, { useState } from 'react';
import {
  Row,
  Alert,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useContentMaterialList } from 'library-authoring/data/apiHooks';
import AlertWrapper from 'shared/Components/Common/AlertWrapper';
import { LoadingSpinner } from '../../../generic/Loading';
import messages from '../messages';
import LibraryItem from './library-item';

type Props = Record<never, never>;

const MAX_ITEMS = 9;

const Libraries: React.FC<Props> = () => {
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterParams, setFilterParams] = useState({});

  const isFiltered = Object.keys(filterParams).length > 0;

  const handleClearFilters = () => {
    setFilterParams({});
    setCurrentPage(1);
  };

  const {
    data,
    isLoading,
    isError,
  } = useContentMaterialList({ page: currentPage, ...filterParams });

  if (isLoading && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const hasMaterials = !isLoading && !isError && ((data!.results.length || 0) > 0);

  return isError ? (
    <AlertWrapper status="danger">
      <span>{intl.formatMessage(messages.librariesTabErrorMessage)}</span>
    </AlertWrapper>
  ) : (
    <div className="courses-tab-container tw-grid tw-grid-cols-3 tw-gap-4">
      { hasMaterials
        ? data!.results.slice(0, MAX_ITEMS).map(({
          id, title, type, image, isAIGenerated,
        }) => (
          <LibraryItem
            key={id}
            displayName={title}
            image={image}
            type={type}
            path={`/library/${id}`}
            isAIGenerated={isAIGenerated}
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
    </div>
  );
};

export default Libraries;
