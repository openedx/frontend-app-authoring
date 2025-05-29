import React, { Suspense, useEffect, useState } from 'react';
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
import { useCourseOutline } from './course-outline/hooks';
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
import { LmsBook } from '@openedx/paragon/icons'; 
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
const CoursePageLayout = ({ children, courseId, courseName }) => (
  <>
    {/* Breadcrumb and Title */}
    <div className="ca-breadcrumb-bg">
      <div className="ca-breadcrumb-container">
        <div className="ca-breadcrumb">
        <span className="ca-breadcrumb-icon">
         <LmsBook className="custom-icon" />
          My Courses
        </span>
          <span className="ca-breadcrumb-divider">/</span>
          <span className="ca-breadcrumb-current">{courseName || 'Loading...'}</span>
        </div>
        <div className="ca-title">
          {courseName || 'Loading...'}
        </div>
      </div>
    </div>
    {/* Main layout */}
    <div className="ca-main-layout">
      <div>
        {/* This div is now redundant, but kept for context. You may remove it if not needed. */}
      </div>
      {/* Sidebar plugin slot, defaults to CourseNavigationSidebar */}
      <div className="ca-sidebar">
        <PluginSlot id="course_sidebar_plugin_slot" pluginProps={{ courseId }} />
      </div>
      <main className="ca-main-content">
        <Suspense>
          {children}
        </Suspense>
      </main>
    </div>
  </>
);

CoursePageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  courseId: PropTypes.string.isRequired,
  courseName: PropTypes.string,
};

const CourseAuthoringRoutes = () => {
  const { courseId } = useParams();
  const { courseName: storeCourseName } = useCourseOutline({ courseId });
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    // Reset course name immediately on courseId change
    setCourseName('');
  }, [courseId]);

  useEffect(() => {
    // Update when new course name is available
    if (storeCourseName) {
      setCourseName(storeCourseName);
    }
  }, [storeCourseName]);

  // Check if courseId is defined before rendering routes that depend on it
  if (!courseId) {
    return <div>Loading course information...</div>;
  }

  return (
    <CourseAuthoringPage courseId={courseId}>
      <Routes>
        {/* Base route for Course Outline */}
        <Route
          path="/"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseOutline courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        {/* Redirect explicit /outline to the base path for consistency */}
        <Route
          path="outline"
          element={<Navigate replace to={`/course/${courseId}/`} />}
        />

        {/* Other course-specific routes wrapped in CoursePageLayout */}
        <Route
          path="course_info"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseUpdates courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="assets"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <FilesPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="videos"
          element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' ? (
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <VideosPage courseId={courseId} />
            </CoursePageLayout>
          ) : null}
        />
        <Route
          path="pages-and-resources/*"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <PagesAndResources courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="proctored-exam-settings"
          element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
        />
        <Route
          path="custom-pages/*"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CustomPages courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        {DECODED_ROUTES.COURSE_UNIT.map((unitPath) => (
          <Route
            key={unitPath}
            path={unitPath}
            element={(
              <CoursePageLayout courseId={courseId} courseName={courseName}>
                <CourseUnit courseId={courseId} />
              </CoursePageLayout>
            )}
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
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <ScheduleAndDetails courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="settings/grading"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <GradingSettings courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="course_team"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseTeam courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="group_configurations"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <GroupConfigurations courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="settings/advanced"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <AdvancedSettings courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="import"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseImportPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="export"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseExportPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="checklists"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <CourseChecklist courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="certificates"
          element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true' ? (
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <Certificates courseId={courseId} />
            </CoursePageLayout>
          ) : null}
        />
        <Route
          path="textbooks"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName}>
              <Textbooks courseId={courseId} />
            </CoursePageLayout>
          )}
        />

        {/* Route outside the CourseAuthoringPage layout */}
        <Route
          path="/new-course"
          element={(
            <PageWrap>
              <CustomCreateNewCourseForm handleOnClickCancel={() => window.history.back()} />
            </PageWrap>
          )}
        />
      </Routes>
    </CourseAuthoringPage>
  );
};

export default CourseAuthoringRoutes;