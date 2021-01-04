import { PageRoute } from '@edx/frontend-platform/react';
import React from 'react';
import { Switch, useRouteMatch } from 'react-router';
import CourseAuthoringPage from './CourseAuthoringPage';
import { CoursePageResources } from './course-page-resources';
import ProctoredExamSettings from './proctored-exam-settings/ProctoredExamSettings';

/**
 * This component and CourseAuthoringPage should maybe be combined once we no longer need to have
 * CourseAuthoringPage split out for use in LegacyProctoringRoute.  Once that route is removed, we
 * can move the Header/Footer rendering to this component and likely pull the course detail loading
 * in as well, and it'd feel a bit better-factored and the roles would feel more clear.
 */
export default function CourseAuthoringRoutes() {
  const { path, params: { courseId } } = useRouteMatch();
  return (
    <CourseAuthoringPage>
      <Switch>
        <PageRoute path={`${path}/course-pages`}>
          <CoursePageResources courseId={courseId} />
        </PageRoute>
        <PageRoute path={`${path}/proctored-exam-settings`}>
          <ProctoredExamSettings courseId={courseId} />
        </PageRoute>
      </Switch>
    </CourseAuthoringPage>
  );
}
