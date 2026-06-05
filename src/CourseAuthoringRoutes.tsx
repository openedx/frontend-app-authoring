import {
  Navigate,
  Routes,
  Route,
  useParams,
  Outlet,
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
  CourseOutlineProvider,
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
import { CourseImportProvider } from './import-page/CourseImportContext';
import { CourseExportProvider } from './export-page/CourseExportContext';

/** Layout route: renders its child routes inside PageWrap. */
const PageWrapLayout = () => (
  <PageWrap>
    <Outlet />
  </PageWrap>
);

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

  const enableVideos = getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true';
  const enableCertificates = getConfig().ENABLE_CERTIFICATE_PAGE === 'true';

  return (
    <CourseAuthoringProvider courseId={courseId}>
      <CourseAuthoringPage>
        <Routes>
          <Route element={<PageWrapLayout />}>
            <Route
              path="/"
              element={
                <CourseOutlineProvider key={courseId}>
                  <OutlineSidebarPagesProvider>
                    <OutlineSidebarProvider>
                      <CourseOutline />
                    </OutlineSidebarProvider>
                  </OutlineSidebarPagesProvider>
                </CourseOutlineProvider>
              }
            />
            <Route
              path="course_info"
              element={<CourseUpdates />}
            />
            <Route
              path="libraries"
              element={<CourseLibraries />}
            />
            <Route
              path="assets"
              element={<FilesPage />}
            />
            {enableVideos && (
              <Route
                path="videos"
                element={<VideosPage />}
              />
            )}
            <Route
              path="pages-and-resources/*"
              element={<PagesAndResources />}
            />
            <Route
              path="custom-pages/*"
              element={<CustomPages />}
            />
            <Route
              path="/subsection/:subsectionId"
              element={<SubsectionUnitRedirect />}
            />
            {DECODED_ROUTES.COURSE_UNIT.map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  <IframeProvider>
                    <CourseUnit />
                  </IframeProvider>
                }
              />
            ))}
            <Route
              path="editor/course-videos/:blockId"
              element={<VideoSelectorContainer />}
            />
            <Route
              path="editor/:blockType/:blockId?"
              element={<EditorContainer learningContextId={courseId} />}
            />
            <Route
              path="settings/details"
              element={<ScheduleAndDetails />}
            />
            <Route
              path="settings/grading"
              element={<GradingSettings />}
            />
            <Route
              path="course_team"
              element={<CourseTeam />}
            />
            <Route
              path="group_configurations"
              element={<GroupConfigurations />}
            />
            <Route
              path="settings/advanced"
              element={<AdvancedSettings />}
            />
            <Route
              path="import"
              element={
                <CourseImportProvider>
                  <CourseImportPage />
                </CourseImportProvider>
              }
            />
            <Route
              path="export"
              element={
                <CourseExportProvider>
                  <CourseExportPage />
                </CourseExportProvider>
              }
            />
            <Route
              path="optimizer"
              element={<CourseOptimizerPage />}
            />
            <Route
              path="checklists"
              element={<CourseChecklist />}
            />
            {enableCertificates && (
              <Route
                path="certificates"
                element={<Certificates />}
              />
            )}
            <Route
              path="textbooks"
              element={<Textbooks />}
            />
          </Route>
          {/* Routes without PageWrap */}
          <Route
            path="proctored-exam-settings"
            element={<Navigate replace to={`/course/${courseId}/pages-and-resources`} />}
          />
        </Routes>
      </CourseAuthoringPage>
    </CourseAuthoringProvider>
  );
};

export default CourseAuthoringRoutes;
