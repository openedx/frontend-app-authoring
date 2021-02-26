import React from 'react';
import PropTypes from 'prop-types';
import { Switch, useRouteMatch } from 'react-router';
import { PageRoute } from '@edx/frontend-platform/react';

import DiscussionAppList from './DiscussionAppList';
import DiscussionConfig from './DiscussionConfig';

/**
 * As of this writing, these routes are mounted at a path prefixed with the following:
 *
 * /course/:courseId
 *
 * Meaning that their absolute paths look like:
 *
 * /course/:courseId/course-pages
 * /course/:courseId/proctored-exam-settings
 *
 * This component and CourseAuthoringPage should maybe be combined once we no longer need to have
 * CourseAuthoringPage split out for use in LegacyProctoringRoute.  Once that route is removed, we
 * can move the Header/Footer rendering to this component and likely pull the course detail loading
 * in as well, and it'd feel a bit better-factored and the roles would feel more clear.
 */
export default function DiscussionsRoutes({ courseId }) {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <PageRoute exact path={`${path}`}>
        <DiscussionAppList courseId={courseId} />
      </PageRoute>
      <PageRoute path={`${path}/configure/:appId`}>
        <DiscussionConfig courseId={courseId} />
      </PageRoute>
    </Switch>
  );
}

DiscussionsRoutes.propTypes = {
  courseId: PropTypes.string.isRequired,
};
