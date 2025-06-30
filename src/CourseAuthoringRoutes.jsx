import { Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Navigate, Routes, Route, useParams, useLocation, useNavigate,
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

const MobileCourseNavigation = ({ items, courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (event) => {
    navigate(event.target.value);
  };

  return (
    <div className="ca-mobile-nav">
      <select
        className="ca-mobile-nav-select"
        value={location.pathname}
        onChange={handleNavigation}
      >
        {items.map(item => (
          <option key={item.path} value={item.path}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};

MobileCourseNavigation.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  })).isRequired,
  courseId: PropTypes.string.isRequired,
};

const CoursePageLayout = ({
  children, courseId, courseName, sidebarItems,
}) => (
  <>
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
    <div className="ca-main-layout">
      <MobileCourseNavigation items={sidebarItems} courseId={courseId} />
      <div className="ca-sidebar">
        <PluginSlot id="course_sidebar_plugin_slot" pluginProps={{ courseId, sidebarItems }} />
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
  sidebarItems: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

const CourseAuthoringRoutes = () => {
  const { courseId } = useParams();
  const { courseName: storeCourseName } = useCourseOutline({ courseId });
  const [courseName, setCourseName] = useState('');

  const sidebarItems = [
    { label: 'Course Outline', path: `/course/${courseId}/` },
    { label: 'Schedule & Details', path: `/course/${courseId}/settings/details` },
    { label: 'Grading', path: `/course/${courseId}/settings/grading` },
    { label: 'Course Team', path: `/course/${courseId}/course_team` },
    { label: 'Certificates', path: `/course/${courseId}/certificates` },
    { label: 'Updates', path: `/course/${courseId}/course_info` },
    { label: 'Group Configurations', path: `/course/${courseId}/group_configurations` },
    { label: 'Advance Settings', path: `/course/${courseId}/settings/advanced` },
    { label: 'Import', path: `/course/${courseId}/import` },
    { label: 'Export', path: `/course/${courseId}/export` },
    { label: 'Files', path: `/course/${courseId}/assets` },
    { label: 'Pages & Resources', path: `/course/${courseId}/pages-and-resources` },
  ];

  useEffect(() => {
    setCourseName('');
  }, [courseId]);

  useEffect(() => {
    if (storeCourseName) {
      setCourseName(storeCourseName);
    }
  }, [storeCourseName]);

  if (!courseId) {
    return <div>Loading course information...</div>;
  }

  return (
    <CourseAuthoringPage courseId={courseId}>
      <Routes>
        <Route
          path="/"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseOutline courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="outline"
          element={<Navigate replace to={`/course/${courseId}/`} />}
        />

        <Route
          path="course_info"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseUpdates courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="assets"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <FilesPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="videos"
          element={getConfig().ENABLE_VIDEO_UPLOAD_PAGE_LINK_IN_CONTENT_DROPDOWN === 'true' ? (
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <VideosPage courseId={courseId} />
            </CoursePageLayout>
          ) : null}
        />
        <Route
          path="pages-and-resources/*"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
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
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CustomPages courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        {DECODED_ROUTES.COURSE_UNIT.map((unitPath) => (
          <Route
            key={unitPath}
            path={unitPath}
            element={(
              <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
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
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <ScheduleAndDetails courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="settings/grading"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <GradingSettings courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="course_team"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseTeam courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="group_configurations"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <GroupConfigurations courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="settings/advanced"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <AdvancedSettings courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="import"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseImportPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="export"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseExportPage courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="checklists"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <CourseChecklist courseId={courseId} />
            </CoursePageLayout>
          )}
        />
        <Route
          path="certificates"
          element={getConfig().ENABLE_CERTIFICATE_PAGE === 'true' ? (
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <Certificates courseId={courseId} />
            </CoursePageLayout>
          ) : null}
        />
        <Route
          path="textbooks"
          element={(
            <CoursePageLayout courseId={courseId} courseName={courseName} sidebarItems={sidebarItems}>
              <Textbooks courseId={courseId} />
            </CoursePageLayout>
          )}
        />
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