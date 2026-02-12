import {
  Navigate, Routes, Route, useParams,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { PageWrap } from '@edx/frontend-platform/react';
import { Textbooks } from './textbooks';
import CourseAuthoringPage from './CourseAuthoringPage';
import { PagesAndResources } from './pages-and-resources';
import EditorContainer from './editors/EditorContainer';
import VideoSelectorContainer from './selectors/VideoSelectorContainer';
import CustomPages from './custom-pages';
import { FilesPage, VideosPage } from './files-and-videos';
import { AdvancedSettings } from './advanced-settings';
import {
  CourseOutline,
  OutlineSidebarProvider,
  OutlineSidebarPagesProvider,
} from './course-outline';
import ScheduleAndDetails from './schedule-and-details';
import { GradingSettings } from './grading-settings';
import CourseTeam from './course-team/CourseTeam';
import { CourseUpdates } from './course-updates';
import { CourseUnit, SubsectionUnitRedirect } from './course-unit';
import { Certificates } from './certificates';
import CourseExportPage from './export-page/CourseExportPage';
import CourseOptimizerPage from './optimizer-page/CourseOptimizerPage';
import CourseImportPage from './import-page/CourseImportPage';
import { DECODED_ROUTES } from './constants';
import CourseChecklist from './course-checklist';
import GroupConfigurations from './group-configurations';
import { CourseLibraries } from './course-libraries';
import { IframeProvider } from './generic/hooks/context/iFrameContext';
import { CourseAuthoringProvider } from './CourseAuthoringContext';

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

  if (courseId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing courseId.');
  }

  return (
    <CourseAuthoringProvider courseId={courseId}>
      <CourseAuthoringPage>
        <Routes>
          <Route
            path="/"
            element={(
              <PageWrap>
                <OutlineSidebarPagesProvider>
                  <OutlineSidebarProvider>
                    <CourseOutline />
                  </OutlineSidebarProvider>
                </OutlineSidebarPagesProvider>
              </PageWrap>
            )}
          />
          <Route
            path="course_info"
            element={<PageWrap><CourseUpdates /></PageWrap>}
          />
          <Route
            path="libraries"
            element={<PageWrap><CourseLibraries /></PageWrap>}
          />
          <Route
            path="assets"
            element={<PageWrap><FilesPage /></PageWrap>}
          />
          <Route
            path="videos"
            element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' ? <PageWrap><VideosPage /></PageWrap> : null}
          />
          <Route
            path="pages-and-resources/*"
            element={<PageWrap><PagesAndResources /></PageWrap>}
          />
          <Route
            path="proctored-exam-settings"
            element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
          />
          <Route
            path="custom-pages/*"
            element={<PageWrap><CustomPages /></PageWrap>}
          />
          <Route
            path="/subsection/:subsectionId"
            element={<PageWrap><SubsectionUnitRedirect /></PageWrap>}
          />
          {DECODED_ROUTES.COURSE_UNIT.map((path) => (
            <Route
              key={path}
              path={path}
              element={(
                <PageWrap>
                  <IframeProvider>
                    <CourseUnit />
                  </IframeProvider>
                </PageWrap>
              )}
            />
          ))}
          <Route
            path="editor/course-videos/:blockId"
            element={<PageWrap><VideoSelectorContainer /></PageWrap>}
          />
          <Route
            path="editor/:blockType/:blockId?"
            element={<PageWrap><EditorContainer learningContextId={courseId} /></PageWrap>}
          />
          <Route
            path="settings/details"
            element={<PageWrap><ScheduleAndDetails /></PageWrap>}
          />
          <Route
            path="settings/grading"
            element={<PageWrap><GradingSettings /></PageWrap>}
          />
          <Route
            path="course_team"
            element={<PageWrap><CourseTeam /></PageWrap>}
          />
          <Route
            path="group_configurations"
            element={<PageWrap><GroupConfigurations /></PageWrap>}
          />
          <Route
            path="settings/advanced"
            element={<PageWrap><AdvancedSettings /></PageWrap>}
          />
          <Route
            path="import"
            element={<PageWrap><CourseImportPage /></PageWrap>}
          />
          <Route
            path="export"
            element={<PageWrap><CourseExportPage /></PageWrap>}
          />
          <Route
            path="optimizer"
            element={<PageWrap><CourseOptimizerPage /></PageWrap>}
          />
          <Route
            path="checklists"
            element={<PageWrap><CourseChecklist /></PageWrap>}
          />
          <Route
            path="certificates"
            element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true' ? <PageWrap><Certificates /></PageWrap> : null}
          />
          <Route
            path="textbooks"
            element={<PageWrap><Textbooks /></PageWrap>}
          />
        </Routes>
      </CourseAuthoringPage>
    </CourseAuthoringProvider>
  );
};

export default CourseAuthoringRoutes;
