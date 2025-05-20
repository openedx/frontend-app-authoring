import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import {
  Navigate, Routes, Route, useParams,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { PageWrap } from '@edx/frontend-platform/react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { Textbooks } from 'CourseAuthoring/textbooks';
import CourseAuthoringPage from './CourseAuthoringPage';
import { PagesAndResources } from './pages-and-resources';
import EditorContainer from './editors/EditorContainer';
import VideoSelectorContainer from './selectors/VideoSelectorContainer';
import CustomPages from './custom-pages';
import { FilesPage, VideosPage } from './files-and-videos';
import { AdvancedSettings } from './advanced-settings';
import { CourseOutline } from './course-outline';
import ScheduleAndDetails from './schedule-and-details';
import { GradingSettings } from './grading-settings';
import CourseTeam from './course-team/CourseTeam';
import { CourseUpdates } from './course-updates';
import { CourseUnit } from './course-unit';
import { Certificates } from './certificates';
import CourseExportPage from './export-page/CourseExportPage';
import CourseImportPage from './import-page/CourseImportPage';
import { DECODED_ROUTES } from './constants';
import CourseChecklist from './course-checklist';
import GroupConfigurations from './group-configurations';
import CustomCreateNewCourseForm from './studio-home/ps-course-form/CustomCreateNewCourseForm';
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
const CoursePageLayout = ({ children, courseId }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar plugin slot, defaults to CourseNavigationSidebar */}
      <div style={{ minWidth: 220, maxWidth: 260, background: '#fff', borderRight: '1px solid #eee' }}>
        <PluginSlot id="course_sidebar_plugin_slot" pluginProps={{ courseId }} />
      </div>
      <main style={{ flex: 1, paddingTop: '1.5rem' }}>
        <Suspense>
          {children}
        </Suspense>
      </main>
    </div>
  );
};

CoursePageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  courseId: PropTypes.string.isRequired,
};

const CourseAuthoringRoutes = () => {
  const { courseId } = useParams();

  // Check if courseId is defined before rendering routes that depend on it
  if (!courseId) {
    // Optionally render a loading state or a message
    return <div>Loading course information...</div>;
  }

  return (
    <CourseAuthoringPage courseId={courseId}>
      <Routes>
        {/* Base route for Course Outline */}
        <Route
          path="/"
          element={<CoursePageLayout courseId={courseId}><CourseOutline courseId={courseId} /></CoursePageLayout>}
        />
        {/* Redirect explicit /outline to the base path for consistency */}
        <Route
          path="outline"
          element={<Navigate replace to={`/course/${courseId}/`} />}
        />

        {/* Other course-specific routes wrapped in CoursePageLayout */}
        <Route
          path="course_info"
          element={<CoursePageLayout courseId={courseId}><CourseUpdates courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="assets"
          element={<CoursePageLayout courseId={courseId}><FilesPage courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="videos"
          element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' ? <CoursePageLayout courseId={courseId}><VideosPage courseId={courseId} /></CoursePageLayout> : null}
        />
        <Route
          path="pages-and-resources/*"
          element={<CoursePageLayout courseId={courseId}><PagesAndResources courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="proctored-exam-settings"
          element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
        />
        <Route
          path="custom-pages/*"
          element={<CoursePageLayout courseId={courseId}><CustomPages courseId={courseId} /></CoursePageLayout>}
        />
        {DECODED_ROUTES.COURSE_UNIT.map((unitPath) => (
          <Route
            key={unitPath}
            path={unitPath}
            element={<CoursePageLayout courseId={courseId}><CourseUnit courseId={courseId} /></CoursePageLayout>}
          />
        ))}
        <Route
          path="editor/course-videos/:blockId"
          element={<PageWrap><VideoSelectorContainer courseId={courseId} /></PageWrap>}
        />
        <Route
          path="editor/:blockType/:blockId?"
          element={<PageWrap><EditorContainer learningContextId={courseId} /></PageWrap>}
        />
        <Route
          path="settings/details"
          element={<CoursePageLayout courseId={courseId}><ScheduleAndDetails courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="settings/grading"
          element={<CoursePageLayout courseId={courseId}><GradingSettings courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="course_team"
          element={<CoursePageLayout courseId={courseId}><CourseTeam courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="group_configurations"
          element={<CoursePageLayout courseId={courseId}><GroupConfigurations courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="settings/advanced"
          element={<CoursePageLayout courseId={courseId}><AdvancedSettings courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="import"
          element={<CoursePageLayout courseId={courseId}><CourseImportPage courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="export"
          element={<CoursePageLayout courseId={courseId}><CourseExportPage courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="checklists"
          element={<CoursePageLayout courseId={courseId}><CourseChecklist courseId={courseId} /></CoursePageLayout>}
        />
        <Route
          path="certificates"
          element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true' ? <CoursePageLayout courseId={courseId}><Certificates courseId={courseId} /></CoursePageLayout> : null}
        />
        <Route
          path="textbooks"
          element={<CoursePageLayout courseId={courseId}><Textbooks courseId={courseId} /></CoursePageLayout>}
        />

        {/* Route outside the CourseAuthoringPage layout? */}
        <Route path="/new-course" element={<PageWrap><CustomCreateNewCourseForm handleOnClickCancel={() => window.history.back()} /></PageWrap>} />
      </Routes>
    </CourseAuthoringPage>
  );
};

export default CourseAuthoringRoutes;
