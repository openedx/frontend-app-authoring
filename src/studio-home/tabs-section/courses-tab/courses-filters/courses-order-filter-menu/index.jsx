import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

import CoursesFilterMenu from '../courses-filter-menu';

const CoursesOrderFilterMenu = ({ onItemMenuSelected }) => {
  const intl = useIntl();

  const courseOrders = useMemo(
    () => [
      {
        id: 'az-courses',
        name: intl.formatMessage(messages.coursesOrderFilterMenuAscendantCurses),
        value: 'azCourses',
      },
      {
        id: 'za-courses',
        name: intl.formatMessage(messages.coursesOrderFilterMenuDescendantCurses),
        value: 'zaCourses',
      },
      {
        id: 'newest-courses',
        name: intl.formatMessage(messages.coursesOrderFilterMenuNewestCurses),
        value: 'newestCourses',
      },
      {
        id: 'oldest-courses',
        name: intl.formatMessage(messages.coursesOrderFilterMenuOldestCurses),
        value: 'oldestCourses',
      },
    ],
    [intl],
  );

  const handleCourseTypeSelected = (courseOrder) => {
    onItemMenuSelected(courseOrder);
  };

  return (
    <CoursesFilterMenu
      id="dropdown-toggle-courses-order-menu"
      menuItems={courseOrders}
      onItemMenuSelected={handleCourseTypeSelected}
      defaultItemSelectedText={intl.formatMessage(messages.coursesOrderFilterMenuAscendantCurses)}
    />
  );
};

CoursesOrderFilterMenu.propTypes = {
  onItemMenuSelected: PropTypes.func.isRequired,
};

export default CoursesOrderFilterMenu;
