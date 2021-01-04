import React from 'react';
import { useRouteMatch } from 'react-router';

import CourseAuthoringPage from '../CourseAuthoringPage';
import ProctoredExamSettings from './ProctoredExamSettings';

/**
 * LEGACY proctored exam settings route!  This is an EXPAND and CONTRACT refactoring - this
 * legacy route exists because we're in an EXPANDED state.  Delete this route when backends
 * no longer send users here.
 *
 * The refactoring is intended to organize our routes by the primary entity first (a course),
 * and the sub-entity second (proctoring settings).  In CourseAuthoringContainer below, you'll see
 * that we flip the routes so that the pages follow the courseId, since they're conceptually
 * children of it.
  */
export default function LegacyProctoringRoute() {
  const { params: { courseId } } = useRouteMatch();
  return (
    <CourseAuthoringPage>
      <ProctoredExamSettings courseId={courseId} />
    </CourseAuthoringPage>
  );
}
