import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Row, Pagination } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { COURSE_CREATOR_STATES } from '../../../constants';
import { getStudioHomeData, getStudioHomeCoursesParams } from '../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../data/slice';
import { fetchStudioHomeData } from '../../data/thunks';
import CardItem from '../../card-item';
import CollapsibleStateWithAction from '../../collapsible-state-with-action';
import { sortAlphabeticallyArray } from '../utils';
import ContactAdministrator from './contact-administrator';
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
  isEnabledPagination,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const {
    courseCreatorStatus,
    optimizationEnabled,
  } = useSelector(getStudioHomeData);
  const { currentPage } = useSelector(getStudioHomeCoursesParams);
  const hasAbilityToCreateCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const showCollapsible = [
    COURSE_CREATOR_STATES.denied,
    COURSE_CREATOR_STATES.pending,
    COURSE_CREATOR_STATES.unrequested,
  ].includes(courseCreatorStatus);

  const handlePageSelected = (page) => {
    dispatch(fetchStudioHomeData(location.search ?? '', false, { page }, true));
    dispatch(updateStudioHomeCoursesCustomParams({ currentPage: page }));
  };
  const hasCourses = coursesDataItems?.length > 0;

  if (isLoading) {
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
        {hasCourses && isEnabledPagination && (
          <div className="d-flex justify-content-end">
            <p data-testid="pagination-info">
              {intl.formatMessage(messages.coursesPaginationInfo, {
                length: coursesDataItems.length,
                total: coursesCount,
              })}
            </p>
          </div>
        )}
        {hasCourses ? (
          <>
            {sortAlphabeticallyArray(coursesDataItems).map(
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
                  isPaginated={isEnabledPagination}
                />
              ),
            )}

            {numPages > 1 && isEnabledPagination && (
              <Pagination
                className="d-flex justify-content-center"
                paginationLabel="pagination navigation"
                pageCount={numPages}
                currentPage={currentPage}
                onPageSelect={handlePageSelected}
              />
            )}
          </>
        ) : (!optimizationEnabled && (
          <ContactAdministrator
            hasAbilityToCreateCourse={hasAbilityToCreateCourse}
            showNewCourseContainer={showNewCourseContainer}
            onClickNewCourse={onClickNewCourse}
          />
        )
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
  coursesCount: 0,
  isEnabledPagination: false,
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
  coursesCount: PropTypes.number,
  isEnabledPagination: PropTypes.bool,
};

export default CoursesTab;
