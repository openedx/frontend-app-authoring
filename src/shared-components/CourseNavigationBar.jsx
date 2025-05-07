import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Nav } from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CourseNavigationBar.scss';

const pathSegmentToNavItem = {
    '': 'Course Outline',
    'outline': 'Course Outline',
    'details': 'Schedule & Details',
    'grading': 'Grading',
    'course_team': 'Course Team',
    'certificates': 'Certificates',
    'enrollments': 'Enrollments',
    'updates': 'Course Updates',
    'attendance': 'Attendance',
    'statistics': 'Fee Statistics',
    'group_configurations': 'Group Configurations',
    'statistics': 'Fee Statistics',
    'group_configurations': 'Group Configurations',
};

const navItemToPathSegment = {
    'Course Outline': '',
    'Schedule & Details': 'settings/details',
    'Grading': 'grading',
    'Course Team': 'course_team',
    'Certificates': 'certificates',
    'Enrollments': 'enrollments',
    'Course Updates': 'updates',
    'Attendance': 'attendance',
    'Fee Statistics': 'statistics',
    'Group Configurations': 'group_configurations',
};

const navItems = Object.keys(navItemToPathSegment);

const CourseNavigationBar = ({ courseId }) => {
    const [activeItem, setActiveItem] = useState('Course Outline');
    const navRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const currentCourseId = courseId || params.courseId;

    const checkScroll = () => {
        if (navRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
            const showLeft = Math.ceil(scrollLeft) > 0;
            const showRight = Math.floor(scrollLeft + clientWidth) < scrollWidth;

            document.querySelector('.scroll-arrow.embedded.left')?.classList.toggle('show', showLeft);
            document.querySelector('.scroll-arrow.embedded.right')?.classList.toggle('show', showRight);
        }
    };

    useEffect(() => {
        checkScroll();
        const currentNav = navRef.current;
        if (currentNav) {
            currentNav.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
        }

        const timer = setTimeout(checkScroll, 150);

        return () => {
            clearTimeout(timer);
            if (currentNav) {
                currentNav.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            }
        };
    }, []);

    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        let navSegment = '';
        for (let i = pathSegments.length - 1; i >= 0; i--) {
            if (pathSegmentToNavItem[pathSegments[i]] !== undefined) {
                navSegment = pathSegments[i];
                break;
            }
        }
        const courseIdIndex = pathSegments.indexOf('course');
        if (courseIdIndex !== -1 && pathSegments.length === courseIdIndex + 2 && pathSegments[courseIdIndex + 1] === currentCourseId) {
            navSegment = '';
        }
        const newItem = pathSegmentToNavItem[navSegment] ?? 'Course Outline';
        if (newItem !== activeItem) {
            setActiveItem(newItem);
        }
    }, [location.pathname, currentCourseId]);

    const handleNavItemClick = (item) => {
        const pathSegment = navItemToPathSegment[item];
        if (pathSegment !== undefined && currentCourseId) {
            const destination = pathSegment
                ? `/course/${currentCourseId}/${pathSegment}`
                : `/course/${currentCourseId}`;
            navigate(destination);
        }
    };

    const handleArrowClick = (direction) => {
        if (navRef.current) {
            const scrollAmount = 200;
            navRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            setTimeout(checkScroll, 150);
        }
    };

    return (
        <div className="course-navigation-bar-container">
            <div className="course-navigation-scroll-container">
                <Nav ref={navRef} className="course-navigation-bar">
                    {navItems.map((item) => (
                        <Nav.Item key={item}>
                            <Nav.Link
                                as="button"
                                className={`nav-link-custom ${activeItem === item ? 'active' : ''}`}
                                onClick={() => handleNavItemClick(item)}
                            >
                                {item}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>

                <button
                    className="scroll-arrow embedded left"
                    onClick={() => handleArrowClick('left')}
                    aria-label="Scroll left"
                >
                    <ChevronLeft />
                </button>
                <button
                    className="scroll-arrow embedded right"
                    onClick={() => handleArrowClick('right')}
                    aria-label="Scroll right"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
};

CourseNavigationBar.propTypes = {
    courseId: PropTypes.string,
};

CourseNavigationBar.defaultProps = {
    courseId: null,
};

export default CourseNavigationBar;