import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Nav } from '@openedx/paragon';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import './VerticalCourseNav.scss'; // We'll create this SCSS file next

// Define mappings outside the component
// Adjusted based on the image and existing routes
const navItemToPathMap = {
  'Course Outline': '',
  'Schedule & Details': 'settings/details',
  Grading: 'settings/grading',
  'Course Team': 'course_team',
  Certificates: 'certificates',
  // 'Enrollment': 'enrollments', // No clear route in CourseAuthoringRoutes.jsx
  'Course Updates': 'course_info',
  // 'Attendance': 'attendance', // No clear route in CourseAuthoringRoutes.jsx
  // 'Fee Statistics': 'statistics', // No clear route in CourseAuthoringRoutes.jsx
  'Group Configurations': 'group_configurations',
  'Advanced Settings': 'settings/advanced',
  // 'Cohorts': 'cohorts', // No clear route in CourseAuthoringRoutes.jsx
  Assets: 'assets',
  Import: 'import',
  Export: 'export',
  // Add other items from the image if corresponding routes exist
};

const navItems = Object.keys(navItemToPathMap);

// Helper to determine the active segment from the path
const getActiveSegment = (pathname, courseId) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const courseIdIndex = pathSegments.indexOf('course');

  if (courseIdIndex === -1 || pathSegments.length <= courseIdIndex + 1
    || pathSegments[courseIdIndex + 1] !== courseId) {
    return null; // Not a valid course path for this navigation
  }

  // Check segments from right-to-left to find the best match
  for (let i = pathSegments.length - 1; i > courseIdIndex + 1; i--) {
    const potentialSegment = pathSegments.slice(courseIdIndex + 2, i + 1).join('/');
    if (Object.values(navItemToPathMap).includes(potentialSegment)) {
      return potentialSegment;
    }
  }

  // If only /course/:courseId, it's the outline
  if (pathSegments.length === courseIdIndex + 2) {
    return ''; // Represents Course Outline
  }

  return null; // No specific segment matched after courseId
};

const VerticalCourseNav = ({ courseId: propCourseId }) => {
  const [activeItem, setActiveItem] = useState('Course Outline');
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const courseId = propCourseId || params.courseId;

  useEffect(() => {
    if (!courseId) { return; } // Don't run if courseId is not available

    const activePathSegment = getActiveSegment(location.pathname, courseId);

    let currentActiveItem = 'Course Outline'; // Default
    if (activePathSegment !== null) {
      // Find the item name corresponding to the active path segment
      const activeEntry = Object.entries(navItemToPathMap).find(([, path]) => path === activePathSegment);
      if (activeEntry) {
        currentActiveItem = activeEntry[0];
      }
    }

    if (currentActiveItem !== activeItem) {
      setActiveItem(currentActiveItem);
    }
  }, [location.pathname, courseId, activeItem]);

  const handleNavItemClick = (item) => {
    const pathSegment = navItemToPathMap[item];
    if (pathSegment !== undefined && courseId) {
      const destination = pathSegment
        ? `/course/${courseId}/${pathSegment}`
        : `/course/${courseId}/`; // Ensure base path ends with /
      navigate(destination);
    }
  };

  if (!courseId) {
    return null; // Don't render if no courseId
  }

  return (
    <Nav vertical className="vertical-course-nav p-3">
      {navItems.map((item) => (
        <Nav.Item key={item}>
          <Nav.Link
            as="button"
            className={`vertical-nav-link ${activeItem === item ? 'active' : ''}`}
            onClick={() => handleNavItemClick(item)}
          >
            {item}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

VerticalCourseNav.propTypes = {
  courseId: PropTypes.string,
};

VerticalCourseNav.defaultProps = {
  courseId: null,
};

export default VerticalCourseNav;
