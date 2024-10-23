import React from 'react';
import {
  Navigate, Routes, Route, useParams,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { PageWrap } from '@edx/frontend-platform/react';
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
import { CourseUnit, IframeProvider } from './course-unit';
import { Certificates } from './certificates';
import CourseExportPage from './export-page/CourseExportPage';
import CourseImportPage from './import-page/CourseImportPage';
import { DECODED_ROUTES } from './constants';
import CourseChecklist from './course-checklist';
import GroupConfigurations from './group-configurations';

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
const CourseAuthoringRoutes = () => {
  const { courseId } = useParams();

  return (
    <CourseAuthoringPage courseId={courseId}>
      <Routes>
        <Route
          path="/"
          element={<PageWrap><CourseOutline courseId={courseId} /></PageWrap>}
        />
        <Route
          path="course_info"
          element={<PageWrap><CourseUpdates courseId={courseId} /></PageWrap>}
        />
        <Route
          path="assets"
          element={<PageWrap><FilesPage courseId={courseId} /></PageWrap>}
        />
        <Route
          path="videos"
          element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' ? <PageWrap><VideosPage courseId={courseId} /></PageWrap> : null}
        />
        <Route
          path="pages-and-resources/*"
          element={<PageWrap><PagesAndResources courseId={courseId} /></PageWrap>}
        />
        <Route
          path="proctored-exam-settings"
          element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
        />
        <Route
          path="custom-pages/*"
          element={<PageWrap><CustomPages courseId={courseId} /></PageWrap>}
        />
        {DECODED_ROUTES.COURSE_UNIT.map((path) => (
          <Route
            key={path}
            path={path}
            element={<PageWrap><IframeProvider><CourseUnit courseId={courseId} /></IframeProvider></PageWrap>}
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
          element={<PageWrap><ScheduleAndDetails courseId={courseId} /></PageWrap>}
        />
        <Route
          path="settings/grading"
          element={<PageWrap><GradingSettings courseId={courseId} /></PageWrap>}
        />
        <Route
          path="course_team"
          element={<PageWrap><CourseTeam courseId={courseId} /></PageWrap>}
        />
        <Route
          path="group_configurations"
          element={<PageWrap><GroupConfigurations courseId={courseId} /></PageWrap>}
        />
        <Route
          path="settings/advanced"
          element={<PageWrap><AdvancedSettings courseId={courseId} /></PageWrap>}
        />
        <Route
          path="import"
          element={<PageWrap><CourseImportPage courseId={courseId} /></PageWrap>}
        />
        <Route
          path="export"
          element={<PageWrap><CourseExportPage courseId={courseId} /></PageWrap>}
        />
        <Route
          path="checklists"
          element={<PageWrap><CourseChecklist courseId={courseId} /></PageWrap>}
        />
        <Route
          path="certificates"
          element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true' ? <PageWrap><Certificates courseId={courseId} /></PageWrap> : null}
        />
        <Route
          path="textbooks"
          element={<PageWrap><Textbooks courseId={courseId} /></PageWrap>}
        />
      </Routes>
    </CourseAuthoringPage>
  );
};

export default CourseAuthoringRoutes;
