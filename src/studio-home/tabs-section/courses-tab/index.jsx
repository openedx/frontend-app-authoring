import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Row,
  Pagination,
  Alert,
} from '@edx/paragon';
import { Error, WarningFilled } from '@edx/paragon/icons';

import { COURSE_CREATOR_STATES } from '../../../constants';
import { getStudioHomeData, getStudioHomeCoursesParams } from '../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../data/slice';
import CardItem from '../../card-item';
import CollapsibleStateWithAction from '../../collapsible-state-with-action';
import ContactAdministrator from './contact-administrator';
import CoursesFilters from './courses-filters';
import ProcessingCourses from '../../processing-courses';
import { LoadingSpinner } from '../../../generic/Loading';
import AlertMessage from '../../../generic/alert-message';
import messages from '../messages';

const CoursesTab = ({
  coursesDataItems,
  showNewCourseContainer,
  onClickNewCourse,
  isShowProcessing,
  isLoading,
  isFailed,
  dispatch,
  numPages,
  coursesCount,
}) => {
  const intl = useIntl();
  const {
    courseCreatorStatus,
    optimizationEnabled,
  } = useSelector(getStudioHomeData);
  const {
    currentPage,
    search,
    order,
    isFiltered,
  } = useSelector(getStudioHomeCoursesParams);
  const hasAbilityToCreateCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const showCollapsible = [
    COURSE_CREATOR_STATES.denied,
    COURSE_CREATOR_STATES.pending,
    COURSE_CREATOR_STATES.unrequested,
  ].includes(courseCreatorStatus);

  const handlePageSelected = (page) => {
    dispatch(updateStudioHomeCoursesCustomParams({
      currentPage: page, search, order, isFiltered,
    }));
  };
  const hasCourses = coursesDataItems?.length;

  const isNotFilteringCourses = !isFiltered && !isLoading;

  if (isLoading && !isFiltered) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    isFailed ? (
      <AlertMessage
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span>{intl.formatMessage(messages.courseTabErrorMessage)}</span>
          </Row>
        )}
      />
    ) : (
      <>
        {isShowProcessing && <ProcessingCourses />}
        <div className="d-flex flex-row justify-content-between my-4">
          <CoursesFilters dispatch={dispatch} />
          {!isLoading && (
            <div className="d-flex">
              <p data-testid="pagination-info">
                {intl.formatMessage(messages.coursesPaginationInfo, {
                  length: coursesDataItems?.length ?? 0,
                  total: coursesCount || 0,
                })}
              </p>
            </div>
          )}
        </div>
        {hasCourses ? (
          <>
            {coursesDataItems.map(
              ({
                courseKey,
                displayName,
                lmsLink,
                org,
                rerunLink,
                number,
                run,
                url,
                cmsLink,
              }) => (
                <CardItem
                  key={courseKey}
                  displayName={displayName}
                  lmsLink={lmsLink}
                  rerunLink={rerunLink}
                  org={org}
                  number={number}
                  run={run}
                  url={url}
                  cmsLink={cmsLink}
                />
              ),
            )}

            {numPages > 1 && (
              <Pagination
                className="d-flex justify-content-center"
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

        {isLoading && isFiltered && (
          <Row className="m-0 mt-4 justify-content-start">
            <LoadingSpinner />
          </Row>
        )}
        {isFiltered && !hasCourses && !isLoading && (
          <Alert variant="warning" icon={WarningFilled} className="mt-4">
            <Alert.Heading>
              {intl.formatMessage(messages.coursesTabCourseNotFoundAlertTitle)}
            </Alert.Heading>
            <p>
              {intl.formatMessage(messages.coursesTabCourseNotFoundAlertMessage)}
            </p>
          </Alert>
        )}
        {showCollapsible && (
          <CollapsibleStateWithAction
            state={courseCreatorStatus}
            className="mt-3"
          />
        )}
      </>
    )
  );
};

CoursesTab.defaultProps = {
  numPages: 0,
};

CoursesTab.propTypes = {
  coursesDataItems: PropTypes.arrayOf(
    PropTypes.shape({
      courseKey: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      lmsLink: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      org: PropTypes.string.isRequired,
      rerunLink: PropTypes.string.isRequired,
      run: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  showNewCourseContainer: PropTypes.bool.isRequired,
  onClickNewCourse: PropTypes.func.isRequired,
  isShowProcessing: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isFailed: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  numPages: PropTypes.number,
  coursesCount: PropTypes.number.isRequired,
};

export default CoursesTab;
