import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Row,
  Pagination,
  Alert,
  Button,
  Form,
  Chip,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { COURSE_CREATOR_STATES } from '@src/constants';
import { getStudioHomeData, getStudioHomeCoursesParams, getLoadingStatuses } from '@src/studio-home/data/selectors';
import { resetStudioHomeCoursesCustomParams, updateStudioHomeCoursesCustomParams } from '@src/studio-home/data/slice';
import { fetchStudioHomeData } from '@src/studio-home/data/thunks';
import CardItem from '@src/studio-home/card-item';
import CollapsibleStateWithAction from '@src/studio-home/collapsible-state-with-action';
import ProcessingCourses from '@src/studio-home/processing-courses';
import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import { RequestStatus } from '@src/data/constants';
import { useMigrationInfo } from '@src/studio-home/data/apiHooks';
import messages from '../messages';
import CoursesFilters from './courses-filters';
import ContactAdministrator from './contact-administrator';
import './index.scss';

interface CardListProps {
  currentPage: number;
  handlePageSelected: (page: any) => void;
  handleCleanFilters: () => void;
  onClickCard?: (courseId: string) => void;
  isLoading: boolean;
  isFiltered: boolean;
  hasAbilityToCreateCourse?: boolean;
  showNewCourseContainer?: boolean;
  onClickNewCourse?: () => void;
  inSelectMode?: boolean;
  selectedCourseId?: string;
  currentLibraryId?: string;
}

const CardList = ({
  currentPage,
  handlePageSelected,
  handleCleanFilters,
  onClickCard,
  isLoading,
  isFiltered,
  hasAbilityToCreateCourse = false,
  showNewCourseContainer = false,
  onClickNewCourse = () => {},
  inSelectMode = false,
  selectedCourseId,
  currentLibraryId,
}: CardListProps) => {
  const {
    courses,
    numPages,
    optimizationEnabled,
  } = useSelector(getStudioHomeData);

  const {
    data: migrationInfoData,
  } = useMigrationInfo(courses?.map(item => item.courseKey) || [], true);

  const processedMigrationInfo = useMemo(() => {
    const result = {};
    if (migrationInfoData) {
      for (const libraries of Object.values(migrationInfoData)) {
        // The map key in `migrationInfoData` is in camelCase.
        // In the processed map, we use the key in its original form.
        result[libraries[0].sourceKey] = libraries.map(item => item.targetKey);
      }
    }
    return result;
  }, [migrationInfoData]);

  const isNotFilteringCourses = !isFiltered && !isLoading;
  const hasCourses = courses?.length > 0;

  const isPreviouslyMigrated = useCallback((courseKey: string) => (
    courseKey in processedMigrationInfo && processedMigrationInfo[courseKey].includes(currentLibraryId)
  ), [processedMigrationInfo]);

  return (
    <>
      {hasCourses ? (
        <>
          {courses.map(
            ({
              courseKey,
              displayName,
              lmsLink,
              org,
              rerunLink,
              number,
              run,
              url,
            }) => (
              <CardItem
                // Add `-migrated` to force re-render of the Chip
                key={`${courseKey}${isPreviouslyMigrated(courseKey) ? '-migrated' : ''}`}
                courseKey={courseKey}
                onClick={() => onClickCard?.(courseKey)}
                itemId={courseKey}
                displayName={displayName}
                lmsLink={lmsLink}
                rerunLink={rerunLink}
                org={org}
                number={number}
                run={run}
                url={url}
                selectMode={inSelectMode ? 'single' : undefined}
                selectPosition={inSelectMode ? 'card' : undefined}
                isSelected={inSelectMode && selectedCourseId === courseKey}
                subtitleBeforeComponent={isPreviouslyMigrated(courseKey) && (
                  <div
                    key={`${courseKey}-${processedMigrationInfo[courseKey].join('-')}`}
                    className="previously-migrated-chip"
                  >
                    <Chip>
                      <FormattedMessage {...messages.previouslyImported} />
                    </Chip>
                  </div>
                )}
              />
            ),
          )}

          {numPages > 1 && (
            <Pagination
              className="d-flex justify-content-center w-100"
              paginationLabel="pagination navigation"
              pageCount={numPages}
              currentPage={currentPage}
              onPageSelect={handlePageSelected}
            />
          )}
        </>
      ) : (!optimizationEnabled && isNotFilteringCourses && (
        <ContactAdministrator
          hasAbilityToCreateCourse={hasAbilityToCreateCourse}
          showNewCourseContainer={showNewCourseContainer}
          onClickNewCourse={onClickNewCourse}
        />
      )
      )}

      {isFiltered && !hasCourses && !isLoading && (
        <Alert className="mt-4">
          <Alert.Heading>
            <FormattedMessage {...messages.coursesTabCourseNotFoundAlertTitle} />
          </Alert.Heading>
          <p data-testid="courses-not-found-alert">
            <FormattedMessage {...messages.coursesTabCourseNotFoundAlertMessage} />
          </p>
          <Button variant="primary" onClick={handleCleanFilters}>
            <FormattedMessage {...messages.coursesTabCourseNotFoundAlertCleanFiltersButton} />
          </Button>
        </Alert>
      )}
    </>
  );
};

interface Props {
  showNewCourseContainer?: boolean;
  onClickNewCourse?: () => void;
  isShowProcessing?: boolean;
  selectedCourseId?: string;
  handleSelect?: (courseId: string) => void;
  currentLibraryId?: string;
}

export const CoursesList: React.FC<Props> = ({
  showNewCourseContainer = false,
  onClickNewCourse = () => {},
  isShowProcessing = false,
  selectedCourseId,
  handleSelect,
  currentLibraryId,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const location = useLocation();
  const {
    courses,
    coursesCount,
    courseCreatorStatus,
  } = useSelector(getStudioHomeData);
  const {
    courseLoadingStatus,
  } = useSelector(getLoadingStatuses);
  const studioHomeCoursesParams = useSelector(getStudioHomeCoursesParams);
  const { currentPage, isFiltered } = studioHomeCoursesParams;
  const hasAbilityToCreateCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const showCollapsible = [
    COURSE_CREATOR_STATES.denied,
    COURSE_CREATOR_STATES.pending,
    COURSE_CREATOR_STATES.unrequested,
  ].includes(courseCreatorStatus as any);
  const locationValue = location.search ?? '';

  const isLoading = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailed = courseLoadingStatus === RequestStatus.FAILED;
  const inSelectMode = handleSelect !== undefined;

  const handlePageSelected = (page) => {
    const {
      search,
      order,
      archivedOnly,
      activeOnly,
    } = studioHomeCoursesParams;

    const customParams = {
      search,
      order,
      archivedOnly,
      activeOnly,
    };

    dispatch(fetchStudioHomeData(locationValue, false, { page, ...customParams }));
    dispatch(updateStudioHomeCoursesCustomParams({ currentPage: page, isFiltered: true }));
  };

  const handleCleanFilters = () => {
    dispatch(resetStudioHomeCoursesCustomParams());
    dispatch(fetchStudioHomeData(locationValue, false, { page: 1, order: 'display_name' }));
  };

  if (isLoading && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    isFailed && !isFiltered ? (
      <AlertMessage
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span data-testid="error-failed-message">{intl.formatMessage(messages.courseTabErrorMessage)}</span>
          </Row>
        )}
      />
    ) : (
      <div className="courses-tab-container">
        <div className="d-flex flex-row align-items-center justify-content-between my-4">
          {isShowProcessing && <ProcessingCourses />}
          <CoursesFilters dispatch={dispatch} locationValue={locationValue} isLoading={isLoading} />
          <p data-testid="pagination-info" className="my-0">
            {intl.formatMessage(messages.coursesPaginationInfo, {
              length: courses?.length,
              total: coursesCount,
            })}
          </p>
        </div>
        {inSelectMode ? (
          <Form.RadioSet
            name="select-courses"
            value={selectedCourseId}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <CardList
              currentPage={currentPage}
              onClickCard={handleSelect}
              handlePageSelected={handlePageSelected}
              handleCleanFilters={handleCleanFilters}
              isLoading={isLoading}
              isFiltered={isFiltered || false}
              inSelectMode
              selectedCourseId={selectedCourseId}
              currentLibraryId={currentLibraryId}
            />
          </Form.RadioSet>
        ) : (
          <CardList
            currentPage={currentPage}
            handlePageSelected={handlePageSelected}
            handleCleanFilters={handleCleanFilters}
            isLoading={isLoading}
            isFiltered={isFiltered || false}
            hasAbilityToCreateCourse={hasAbilityToCreateCourse}
            showNewCourseContainer={showNewCourseContainer}
            onClickNewCourse={onClickNewCourse}
          />
        )}

        {showCollapsible && (
          <CollapsibleStateWithAction
            state={courseCreatorStatus!}
            className="mt-3"
          />
        )}
      </div>
    )
  );
};
