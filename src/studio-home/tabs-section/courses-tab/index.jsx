import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { COURSE_CREATOR_STATES } from '../../../constants';
import { getStudioHomeData } from '../../data/selectors';
import CardItem from '../../card-item';
import CollapsibleStateWithAction from '../../collapsible-state-with-action';
import { sortAlphabeticallyArray } from '../utils';
import ContactAdministrator from './contact-administrator';
import ProcessingCourses from '../../processing-courses';

const CoursesTab = ({
  coursesDataItems,
  showNewCourseContainer,
  onClickNewCourse,
  isShowProcessing,
}) => {
  const {
    courseCreatorStatus,
    optimizationEnabled,
  } = useSelector(getStudioHomeData);
  const hasAbilityToCreateCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const showCollapsible = [
    COURSE_CREATOR_STATES.denied,
    COURSE_CREATOR_STATES.pending,
    COURSE_CREATOR_STATES.unrequested,
  ].includes(courseCreatorStatus);

  return (
    <>
      {isShowProcessing && <ProcessingCourses />}
      {coursesDataItems?.length ? (
        sortAlphabeticallyArray(coursesDataItems).map(
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
              key={courseKey}
              displayName={displayName}
              lmsLink={lmsLink}
              rerunLink={rerunLink}
              org={org}
              number={number}
              run={run}
              url={url}
            />
          ),
        )
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
  );
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
};

export default CoursesTab;
