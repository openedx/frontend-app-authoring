import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import './CourseNavigationSidebar.scss';
import messages from './messages';

const Sidebar = ({ buttons, onNavigate, presentPath }) => (
  <nav className="course-sidebar-nav">
    <ul className="course-sidebar-list">
      {buttons.map(item => {
        const isActive = presentPath === item.path;
        return (
          <li
            key={item.path}
            className={`course-sidebar-item${isActive ? ' active' : ''}`}
          >
            <button
              type="button"
              onClick={() => onNavigate(item.path)}
              className="course-sidebar-link"
              style={{ fontWeight: isActive ? 'normal' : 'normal' }}
            >
              {item.icon && <span className="course-sidebar-icon">{item.icon}</span>}
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

Sidebar.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.node,
  })).isRequired,
  onNavigate: PropTypes.func.isRequired,
  presentPath: PropTypes.string.isRequired,
};
// --- END Placeholder ---

const CourseNavigationSidebar = ({ courseId: propCourseId }) => {
  const params = useParams();
  const courseId = propCourseId || params.courseId;
  const navigate = useNavigate();
  const location = useLocation();
  const presentPath = location.pathname;
  const intl = useIntl();

  // --- ADAPT sidebarItems ---
  // Map the authoring sections to the sidebar structure.
  // Use the actual routes from CourseAuthoringRoutes.jsx.
  const sidebarItems = [
    { label: intl.formatMessage(messages.sidebarCourseOutline), path: `/course/${courseId}` },
    { label: intl.formatMessage(messages.sidebarScheduleDetails), path: `/course/${courseId}/settings/details` },
    { label: intl.formatMessage(messages.sidebarGrading), path: `/course/${courseId}/settings/grading` }, // Note: path adjusted from previous nav bar
    { label: intl.formatMessage(messages.sidebarCourseTeam), path: `/course/${courseId}/course_team` },
    { label: intl.formatMessage(messages.sidebarCertificates), path: `/course/${courseId}/certificates` },
    // { label: 'Enrollments', path: `/course/${courseId}/enrollments`, icon: <HowToReg /> }, // Uncomment if needed
    { label: intl.formatMessage(messages.sidebarUpdates), path: `/course/${courseId}/course_info` }, // Map to course_info route
    // { label: 'Attendance', path: `/course/${courseId}/attendance`, icon: <EventBusy /> }, // Uncomment if needed
    // { label: 'Fee Statistics', path: `/course/${courseId}/statistics`, icon: <QueryStats /> }, // Uncomment if needed
    { label: intl.formatMessage(messages.sidebarGroupConfigurations), path: `/course/${courseId}/group_configurations` },
    { label: intl.formatMessage(messages.sidebarAdvancedSettings), path: `/course/${courseId}/settings/advanced` },
    { label: intl.formatMessage(messages.sidebarImport), path: `/course/${courseId}/import` },
    { label: intl.formatMessage(messages.sidebarExport), path: `/course/${courseId}/export` },
    { label: intl.formatMessage(messages.sidebarChecklists), path: `/course/${courseId}/checklists` },
    { label: intl.formatMessage(messages.sidebarFiles), path: `/course/${courseId}/assets` },
    { label: intl.formatMessage(messages.sidebarPagesResources), path: `/course/${courseId}/pages-and-resources` },
    // Add other relevant course authoring pages here
  ];
    // --- END ADAPT ---

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (!courseId) {
    return null;
  }

  return (
    <Sidebar
      buttons={sidebarItems}
      onNavigate={handleNavigate}
      presentPath={presentPath}
    />
  );
};

CourseNavigationSidebar.propTypes = {
  courseId: PropTypes.string,
};

CourseNavigationSidebar.defaultProps = {
  courseId: undefined,
};

export default CourseNavigationSidebar;
