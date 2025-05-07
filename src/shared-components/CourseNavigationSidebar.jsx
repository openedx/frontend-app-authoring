import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CourseNavigationSidebar.scss';

// --- ASSUMPTION: Sidebar component import ---
// Import the Sidebar component. Adjust the path based on your project structure.
// import Sidebar from '../path/to/your/Sidebar';
// Using a placeholder if Sidebar component is not defined
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
                            style={{ fontWeight: isActive ? 'bold' : 'normal' }}
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

    // --- ADAPT sidebarItems ---
    // Map the authoring sections to the sidebar structure.
    // Use the actual routes from CourseAuthoringRoutes.jsx.
    const sidebarItems = [
        { label: 'Course Outlines', path: `/course/${courseId}` },
        { label: 'Schedule & Details', path: `/course/${courseId}/settings/details` },
        { label: 'Grading', path: `/course/${courseId}/settings/grading` }, // Note: path adjusted from previous nav bar
        { label: 'Course Team', path: `/course/${courseId}/course_team` },
        { label: 'Certificates', path: `/course/${courseId}/certificates` },
        // { label: 'Enrollments', path: `/course/${courseId}/enrollments`, icon: <HowToReg /> }, // Uncomment if needed
        { label: 'Updates', path: `/course/${courseId}/course_info` }, // Map to course_info route
        // { label: 'Attendance', path: `/course/${courseId}/attendance`, icon: <EventBusy /> }, // Uncomment if needed
        // { label: 'Fee Statistics', path: `/course/${courseId}/statistics`, icon: <QueryStats /> }, // Uncomment if needed
        { label: 'Group Configurations', path: `/course/${courseId}/group_configurations` },
        { label: 'Advance Settings', path: `/course/${courseId}/settings/advanced` },
        { label: 'Import', path: `/course/${courseId}/import` },
        { label: 'Export', path: `/course/${courseId}/export` },
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
