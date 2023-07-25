import React from 'react';
import PropTypes from 'prop-types';
import { Switch, useRouteMatch } from 'react-router';
import { PageRoute } from '@edx/frontend-platform/react';
import Placeholder from '@edx/frontend-lib-content-components';
import CourseAuthoringPage from './CourseAuthoringPage';
import { PagesAndResources } from './pages-and-resources';
import ProctoredExamSettings from './proctored-exam-settings/ProctoredExamSettings';
import EditorContainer from './editors/EditorContainer';
import VideoSelectorContainer from './selectors/VideoSelectorContainer';
import CustomPages from './custom-pages';
import { AdvancedSettings } from './advanced-settings';

/**
 * As of this writing, these routes are mounted at a path prefixed with the following:
 *
 * /course/:courseId
 *
 * Meaning that their absolute paths look like:
 *
 * /course/:courseId/course-pages
 * /course/:courseId/proctored-exam-settings
 * /course/:courseId/editor/:blockType/:blockId
 *
 * This component and CourseAuthoringPage should maybe be combined once we no longer need to have
 * CourseAuthoringPage split out for use in LegacyProctoringRoute.  Once that route is removed, we
 * can move the Header/Footer rendering to this component and likely pull the course detail loading
 * in as well, and it'd feel a bit better-factored and the roles would feel more clear.
 */
const CourseAuthoringRoutes = ({ courseId }) => {
  const { path } = useRouteMatch();
  return (
    <CourseAuthoringPage courseId={courseId}>
      <Switch>
        <PageRoute path={`${path}/outline`}>
          {process.env.ENABLE_NEW_COURSE_OUTLINE_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/course_info`}>
          {process.env.ENABLE_NEW_UPDATES_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/assets`}>
          {process.env.ENABLE_NEW_FILES_UPLOADS_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/videos`}>
          {process.env.ENABLE_NEW_VIDEO_UPLOAD_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/pages-and-resources`}>
          <PagesAndResources courseId={courseId} />
        </PageRoute>
        <PageRoute path={`${path}/proctored-exam-settings`}>
          <ProctoredExamSettings courseId={courseId} />
        </PageRoute>
        <PageRoute path={`${path}/custom-pages`}>
          <CustomPages courseId={courseId} />
        </PageRoute>
        <PageRoute path={`${path}/container/:blockId`}>
          {process.env.ENABLE_UNIT_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/editor/course-videos/:blockId`}>
          {process.env.ENABLE_NEW_EDITOR_PAGES === 'true'
            && (
              <VideoSelectorContainer
                courseId={courseId}
              />
            )}
        </PageRoute>
        <PageRoute path={`${path}/editor/:blockType/:blockId?`}>
          {process.env.ENABLE_NEW_EDITOR_PAGES === 'true'
            && (
              <EditorContainer
                courseId={courseId}
              />
            )}
        </PageRoute>
        <PageRoute path={`${path}/settings/details`}>
          {process.env.ENABLE_NEW_SCHEDULE_DETAILS_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/settings/grading`}>
          {process.env.ENABLE_NEW_GRADING_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/course_team`}>
          {process.env.ENABLE_NEW_COURSE_TEAM_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/settings/advanced`}>
          <AdvancedSettings courseId={courseId} />
        </PageRoute>
        <PageRoute path={`${path}/import`}>
          {process.env.ENABLE_NEW_IMPORT_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
        <PageRoute path={`${path}/export`}>
          {process.env.ENABLE_NEW_EXPORT_PAGE === 'true'
            && (
              <Placeholder />
            )}
        </PageRoute>
      </Switch>
    </CourseAuthoringPage>
  );
};

CourseAuthoringRoutes.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseAuthoringRoutes;
