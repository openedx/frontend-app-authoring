import React from 'react';
import { useSelector } from 'react-redux';
import { screen, fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CoursesTypesFilterMenu from '.';
import message from './messages';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('CoursesTypesFilterMenu', () => {
  // eslint-disable-next-line react/prop-types
  const IntlProviderWrapper = ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  );

  const onItemMenuSelectedMock = jest.fn();

  const renderComponent = (overrideProps = {}) => render(
    <IntlProviderWrapper>
      <CoursesTypesFilterMenu
        onItemMenuSelected={onItemMenuSelectedMock}
        {...overrideProps}
      />
    </IntlProviderWrapper>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue({
      currentPage: 1,
      order: 'display_name',
      search: '',
      activeOnly: false,
      archivedOnly: false,
      cleanFilters: false,
    });
  });

  it('snapshot', () => {
    const { container } = renderComponent();
    expect(container).toMatchSnapshot();
  });

  it('should render without crashing', () => {
    renderComponent();
    const courseTypesMenu = screen.getByTestId('dropdown-toggle-course-type-menu');
    expect(courseTypesMenu).toBeInTheDocument();
  });

  it('should show the items when the menu is clicked', () => {
    renderComponent();
    const courseTypeMenuFilter = screen.getByTestId('dropdown-toggle-course-type-menu');
    fireEvent.click(courseTypeMenuFilter);
    const { defaultMessage: activeCoursesMenuText } = message.coursesTypesFilterMenuActiveCurses;
    const { defaultMessage: allCoursesMenuText } = message.coursesTypesFilterMenuAllCurses;
    const { defaultMessage: archiveCoursesMenuText } = message.coursesTypesFilterMenuArchivedCurses;
    const activeCoursesMenuItem = screen.getByText(activeCoursesMenuText);
    const allCoursesMenuItem = screen.getByTestId('item-menu-all-courses');
    const archiveCoursesMenuItem = screen.getByText(archiveCoursesMenuText);
    expect(activeCoursesMenuItem).toBeInTheDocument();
    expect(allCoursesMenuItem.textContent).toContain(allCoursesMenuText);
    expect(archiveCoursesMenuItem).toBeInTheDocument();
  });

  it('should show an icon when a menu item is selected ', () => {
    renderComponent();
    const courseTypesMenu = screen.getByTestId('dropdown-toggle-course-type-menu');
    fireEvent.click(courseTypesMenu);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);
    fireEvent.click(courseTypesMenu);
    expect(screen.getByTestId('menu-item-icon')).toBeInTheDocument();
  });

  it('should call onCourseTypeSelected function when a menu item is selected ', () => {
    renderComponent();
    const courseTypesMenu = screen.getByTestId('dropdown-toggle-course-type-menu');
    fireEvent.click(courseTypesMenu);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);
    expect(onItemMenuSelectedMock).toHaveBeenCalled();
  });
});
