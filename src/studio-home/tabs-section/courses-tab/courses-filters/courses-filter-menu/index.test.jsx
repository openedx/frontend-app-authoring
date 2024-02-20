import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';

import CoursesFilterMenu from '.';

describe('CoursesFilterMenu', () => {
  const onCourseTypeSelectedMock = jest.fn();

  const menuItemsMock = [
    {
      id: 'active-courses',
      name: 'Active',
      value: 'active-courses',
    },
    {
      id: 'upcoming-courses',
      name: 'Upcoming',
      value: 'upcoming-courses',
    },
    {
      id: 'archived-courses',
      name: 'Archived',
      value: 'archived-courses',
    },
  ];

  const renderComponent = (overrideProps = {}) => render(
    <CoursesFilterMenu
      menuItems={menuItemsMock}
      onItemMenuSelected={onCourseTypeSelectedMock}
      id="course-filter-menu-toggle"
      {...overrideProps}
    />,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('snapshot', () => {
    const { container } = renderComponent();
    expect(container).toMatchSnapshot();
  });

  it('should render without crashing', () => {
    renderComponent();
    const courseFilterMenuToggle = screen.getByTestId('course-filter-menu-toggle');
    expect(courseFilterMenuToggle).toBeInTheDocument();
  });

  it('should show the items when the menu is clicked', () => {
    renderComponent();
    const courseFilterMenuToggle = screen.getByTestId('course-filter-menu-toggle');
    expect(courseFilterMenuToggle).toBeInTheDocument();
    fireEvent.click(courseFilterMenuToggle);
    const activeCoursesMenuItem = screen.getByText('Active');
    const upcomingCoursesMenuItem = screen.getByText('Upcoming');
    const archiveCoursesMenuItem = screen.getByText('Archived');
    expect(activeCoursesMenuItem).toBeInTheDocument();
    expect(upcomingCoursesMenuItem).toBeInTheDocument();
    expect(archiveCoursesMenuItem).toBeInTheDocument();
  });

  it('should show an icon when a menu item is selected', () => {
    renderComponent();
    const courseFilterMenuToggle = screen.getByTestId('course-filter-menu-toggle');
    expect(courseFilterMenuToggle).toBeInTheDocument();
    fireEvent.click(courseFilterMenuToggle);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);
    fireEvent.click(courseFilterMenuToggle);
    expect(screen.getByTestId('menu-item-icon')).toBeInTheDocument();
  });

  it('should call onCourseTypeSelected function when a menu item is selected ', () => {
    renderComponent();
    const courseFilterMenuToggle = screen.getByTestId('course-filter-menu-toggle');
    expect(courseFilterMenuToggle).toBeInTheDocument();
    fireEvent.click(courseFilterMenuToggle);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);
    expect(onCourseTypeSelectedMock).toHaveBeenCalled();
  });
});
