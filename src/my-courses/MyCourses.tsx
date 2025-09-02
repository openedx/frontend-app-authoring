import React, { useEffect, useCallback } from 'react';
import {
  Button, Container, Icon, Pagination, Row,
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

  const myCoursesParams = useSelector(getMyCoursesParams);
  const { currentPage, isFiltered } = myCoursesParams;

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
      search, order, archivedOnly, activeOnly,
    } = myCoursesParams;
    const customParams = {
      search, order, archivedOnly, activeOnly,
    };

    dispatch(fetchMyCoursesData(locationValue, false, { page, ...customParams }, true));
    dispatch(updateMyCoursesCoursesCustomParams({ currentPage: page, isFiltered: true }));
  }, [dispatch, locationValue, myCoursesParams]);

  const isNotFilteringCourses = !isFiltered && !isLoadingCourses;
  const hasCourses = courses?.length > 0;

  useEffect(() => {
    courses.forEach(course => {
      dispatch(fetchCourseDetail(course.courseKey));
    });
  }, [courses, dispatch]);

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
        onClickNewCourse={() => {}}
      />
    )
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
          {hasCourses ? renderCourseGrid() : renderEmptyState()}
        </div>
      )}
    </Container>
  );
};

export default MyCourses;
