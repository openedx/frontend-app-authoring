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

const CourseNavigationSidebar = ({ sidebarItems }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const presentPath = location.pathname;

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (!params.courseId) {
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
  sidebarItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    path: PropTypes.string,
  })).isRequired,
};

export default CourseNavigationSidebar;
