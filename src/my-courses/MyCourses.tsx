import React, { useEffect, useCallback, useState } from 'react';
import {
  Alert, Button, Container, Icon, Pagination, Row, SearchField,
} from '@openedx/paragon';
import './MyCourses.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useLocation, useNavigate } from 'react-router';
import AlertMessage from 'generic/alert-message';
import { Add, Error } from '@openedx/paragon/icons';
import messages from 'studio-home/tabs-section/messages';
// import CourseFilter from './course-filter/CourseFilter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { debounce } from 'lodash';
import { useMyCourses } from './hooks';
import { getCourseDetail, getMyCoursesParams } from './data/selectors';
import { fetchMyCoursesData } from './data/thunks';
import { updateMyCoursesCoursesCustomParams } from './data/slice';
import { LoadingSpinner } from '../generic/Loading';
import CoursesFilters from './courses-filters';
import CourseCard from './course-card/CourseCard';
import ContactAdministrator from '../studio-home/tabs-section/courses-tab/contact-administrator';
import { fetchCourseDetail } from '../data/thunks';

interface Course {
  courseKey: string;
  displayName: string;
  lmsLink: string;
  org: string;
  rerunLink: string;
  number: string;
  run: string;
  url: string;
  courseImage?: string;
}

const MyCourses = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const courseDetails = useSelector(getCourseDetail);
  const [isReRunEnabled, setIsReRunEnabled] = useState(false);
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [showNoResultsAlert, setShowNoResultsAlert] = useState(false);

  const myCoursesParams = useSelector(getMyCoursesParams);
  const {
    currentPage, isFiltered, search, order, archivedOnly, activeOnly, cleanFilters,
  } = myCoursesParams;

  const locationValue = location.search ?? '';

  const {
    myCoursesData,
    hasAbilityToCreateNewCourse,
    isLoadingPage: isLoadingCourses,
    isFailedLoadingPage: isFailedCoursesPage,
  } = useMyCourses();

  const {
    courses = [],
    numPages = 0,
    optimizationEnabled,
  } = myCoursesData || {};

  const handlePageSelected = useCallback((page: number) => {
    const {
      search: searchParam, order: orderParam, archivedOnly: archivedOnlyParam, activeOnly: activeOnlyParam,
    } = myCoursesParams;
    const customParams = {
      search: searchParam, order: orderParam, archivedOnly: archivedOnlyParam, activeOnly: activeOnlyParam,
    };

    dispatch(fetchMyCoursesData(locationValue, false, { page, ...customParams }, true));
    dispatch(updateMyCoursesCoursesCustomParams({ currentPage: page, isFiltered: true }));
  }, [dispatch, locationValue, myCoursesParams]);

  // regex to check if a string has only whitespace
  const regexOnlyWhiteSpaces = /^\s+$/;

  const handleSearchCourses = (searchValueDebounced) => {
    const valueFormatted = searchValueDebounced.trim();
    const filterParams = {
      search: valueFormatted.length > 0 ? valueFormatted : undefined,
      activeOnly,
      archivedOnly,
      order,
    };
    const hasOnlySpaces = regexOnlyWhiteSpaces.test(searchValueDebounced);

    if (valueFormatted !== search && !hasOnlySpaces && !cleanFilters) {
      dispatch(updateMyCoursesCoursesCustomParams({
        currentPage: 1,
        isFiltered: true,
        cleanFilters: false,
        ...filterParams,
      }));

      dispatch(fetchMyCoursesData(locationValue, false, { page: 1, ...filterParams }, true));
    }

    setInputSearchValue(searchValueDebounced);
  };

  const handleSearchCoursesDebounced = useCallback(
    debounce((value) => handleSearchCourses(value), 400),
    [activeOnly, archivedOnly, order, inputSearchValue],
  );

  const handleCleanFilters = useCallback(() => {
    dispatch(updateMyCoursesCoursesCustomParams({
      currentPage: 1,
      search: undefined,
      order: 'display_name',
      archivedOnly: undefined,
      activeOnly: undefined,
      isFiltered: false,
      cleanFilters: true,
    }));
    setInputSearchValue('');
    setShowNoResultsAlert(false);
    dispatch(fetchMyCoursesData(locationValue, false, { page: 1 }, true));
  }, [dispatch, locationValue]);

  const isNotFilteringCourses = !isFiltered && !isLoadingCourses;
  const hasCourses = courses?.length > 0;

  useEffect(() => {
    const fetchNavigationItems = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
        // const response = await getAuthenticatedHttpClient().get(
        //   'https://staging.titaned.com/titaned/api/v1/menu-config/',
        // );
        if (response.status !== 200) {
          throw new Error('Failed to fetch Navigation Items');
        }
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch navigation items, using defaults:', error);
        return {
          allow_course_reruns: false,
        };
      }
    };

    fetchNavigationItems().then((data) => {
      setIsReRunEnabled(data?.allow_course_reruns || false);
    }).catch((error) => {
      console.error('Error in fetchNavigationItems:', error);
      setIsReRunEnabled(false);
    });
  }, []);

  useEffect(() => {
    courses.forEach(course => {
      dispatch(fetchCourseDetail(course.courseKey));
    });
  }, [courses, dispatch]);

  // Handle delayed showing of no results alert
  useEffect(() => {
    const hasCompletedLoading = !isLoadingCourses && !isFailedCoursesPage;
    const shouldShowAlert = isFiltered && !hasCourses && hasCompletedLoading;

    if (shouldShowAlert) {
      // Delay showing the alert by 1.5 seconds to prevent blinking during loading
      const timer = setTimeout(() => {
        setShowNoResultsAlert(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
    // Hide alert immediately if conditions are no longer met
    setShowNoResultsAlert(false);
  }, [isFiltered, hasCourses, isLoadingCourses, isFailedCoursesPage]);

  const updatedCourses: Course[] = courses.map(course => {
    const courseDetail = courseDetails.find(detail => detail.courseId === course.courseKey);
    const defaultImageName = 'images_course_image.jpg';
    const defaultImageName2 = 'pencils.jpg';
    if (courseDetail) {
      const imageUri = courseDetail.media.courseImage.uri;
      const imageUrl = `${getConfig().STUDIO_BASE_URL}${imageUri}`;
      return {
        ...course,
        courseImage: imageUri.includes(defaultImageName) || imageUri.includes(defaultImageName2) ? null : imageUrl,
      };
    }
    return {
      ...course,
      courseImage: null,
    };
  });

  if (isLoadingCourses && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  const renderErrorState = () => (
    <AlertMessage
      variant="danger"
      description={(
        <Row className="m-0 align-items-center">
          <Icon src={Error} className="text-danger-500 mr-1" />
          <span data-testid="error-failed-message">
            {intl.formatMessage(messages.courseTabErrorMessage)}
          </span>
        </Row>
      )}
    />
  );

  const renderCourseGrid = () => (
    <>
      <div className="course-grid">
        {updatedCourses.map((course) => (
          <div key={course.courseKey} className="course-cards-content">
            <CourseCard
              imageSrc={course.courseImage}
              title={course.displayName}
              metadata={`${course.org} / ${course.number} / ${course.run}`}
              onViewLive={() => window.open(course.lmsLink ?? '#', '_blank')}
              onEditCourse={() => navigate(course.url ?? '#')}
              onReRun={() => navigate(course.rerunLink ?? '#')}
              isReRunEnabled={isReRunEnabled}
            />
          </div>
        ))}
      </div>
      {numPages > 1 && (
        <div className="pagination-container">
          <Pagination
            className="d-flex justify-content-end"
            paginationLabel="pagination navigation"
            pageCount={numPages}
            currentPage={currentPage}
            onPageSelect={handlePageSelected}
            size="sm"
          />
        </div>
      )}
    </>
  );

  const renderEmptyState = () => (
    !optimizationEnabled && isNotFilteringCourses && (
      <ContactAdministrator
        hasAbilityToCreateCourse={hasAbilityToCreateNewCourse}
        showNewCourseContainer={false}
        onClickNewCourse={() => navigate('/new-course')}
      />
    )
  );

  const renderNoCoursesFoundAlert = () => (
    showNoResultsAlert ? (
      <Alert className="mt-4">
        <Alert.Heading>
          {intl.formatMessage(messages.coursesTabCourseNotFoundAlertTitle)}
        </Alert.Heading>
        <p data-testid="courses-not-found-alert">
          {intl.formatMessage(messages.coursesTabCourseNotFoundAlertMessage)}
        </p>
        <Button variant="primary" onClick={handleCleanFilters}>
          {intl.formatMessage(messages.coursesTabCourseNotFoundAlertCleanFiltersButton)}
        </Button>
      </Alert>
    ) : null
  );

  return (
    <Container className="mt-4">
      {/* Add the filters at the top */}
      {/* <CoursesFilter dispatch={dispatch} locationValue="/my-courses" /> */}
      {/* <CourseFilter
        coursesDataItems={courses}
        showNewCourseContainer
        // onClickNewCourse={onClickNewCourse}
        // isShowProcessing={isShowProcessing}
        isLoading={isLoadingCourses}
        isFailed={isFailedCoursesPage}
        numPages={numPages}
        coursesCount={coursesCount}
        isEnabledPagination
      /> */}
      {isFailedCoursesPage && !isFiltered ? (
        renderErrorState()
      ) : (
        <div>
          {/* {isShowProcessing && !isEnabledPagination && <ProcessingCourses />} */}
          <div className="d-flex justify-content-between align-items-center mb-3 gap-3 filters-container">
            <div className="my-courses-title">My Courses</div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex flex-row my-courses-search-field">
                <SearchField
                  onSubmit={handleSearchCourses}
                  onChange={handleSearchCoursesDebounced}
                  value={cleanFilters ? '' : inputSearchValue}
                  className="mr-4"
                  data-testid="input-filter-courses-search"
                  placeholder="Search"
                />
              </div>
              <CoursesFilters
                dispatch={dispatch}
                locationValue={locationValue}
                isLoading={isLoadingCourses}
              />
              {hasAbilityToCreateNewCourse && (
                <Button
                  variant="outline-primary"
                  iconBefore={Add}
                  size="sm"
                  data-testid="new-course-button"
                  onClick={() => navigate('/new-course')}
                >
                  Create Course
                </Button>
              )}
            </div>
          </div>
          {isLoadingCourses && isFiltered ? (
            <Row className="m-0 mt-4 justify-content-center">
              <LoadingSpinner />
            </Row>
          ) : (
            <>
              {hasCourses ? renderCourseGrid() : renderEmptyState()}
              {renderNoCoursesFoundAlert()}
            </>
          )}
        </div>
      )}
    </Container>
  );
};

export default MyCourses;
