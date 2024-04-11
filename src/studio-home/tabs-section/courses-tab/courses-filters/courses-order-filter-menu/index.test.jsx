import React from 'react';
import { useSelector } from 'react-redux';
import { screen, fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CoursesOrderFilterMenu from '.';
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
      <CoursesOrderFilterMenu
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
    const courseOrderMenu = screen.getByTestId('dropdown-toggle-courses-order-menu');
    expect(courseOrderMenu).toBeInTheDocument();
  });

  it('should show the items when the menu is clicked', () => {
    renderComponent();
    const courseOrderMenuFilter = screen.getByTestId('dropdown-toggle-courses-order-menu');
    fireEvent.click(courseOrderMenuFilter);
    const { defaultMessage: ascendantCoursesMenuText } = message.coursesOrderFilterMenuAscendantCurses;
    const { defaultMessage: descendantCoursesMenuText } = message.coursesOrderFilterMenuDescendantCurses;
    const { defaultMessage: newWestCoursesMenuText } = message.coursesOrderFilterMenuNewestCurses;
    const { defaultMessage: oldestCoursesMenuText } = message.coursesOrderFilterMenuOldestCurses;
    const ascendantCoursesMenuItem = screen.getByTestId('item-menu-az-courses');
    const descendantCoursesMenuItem = screen.getByText(descendantCoursesMenuText);
    const newestCoursesMenuItem = screen.getByText(newWestCoursesMenuText);
    const oldestCoursesMenuItem = screen.getByText(oldestCoursesMenuText);
    expect(ascendantCoursesMenuItem.textContent).toContain(ascendantCoursesMenuText);
    expect(descendantCoursesMenuItem).toBeInTheDocument();
    expect(newestCoursesMenuItem).toBeInTheDocument();
    expect(oldestCoursesMenuItem).toBeInTheDocument();
  });

  it('should show an icon when a menu item is selected ', () => {
    renderComponent();
    const courseOrderMenu = screen.getByTestId('dropdown-toggle-courses-order-menu');
    fireEvent.click(courseOrderMenu);
    const ascendantCoursesMenuItem = screen.getByTestId('item-menu-az-courses');
    fireEvent.click(ascendantCoursesMenuItem);
    fireEvent.click(courseOrderMenu);
    expect(screen.getByTestId('menu-item-icon')).toBeInTheDocument();
  });

  it('should call onCourseTypeSelected function when a menu item is selected ', () => {
    renderComponent();
    const courseOrderMenu = screen.getByTestId('dropdown-toggle-courses-order-menu');
    fireEvent.click(courseOrderMenu);
    const ascendantCoursesMenuItem = screen.getByTestId('item-menu-az-courses');
    fireEvent.click(ascendantCoursesMenuItem);
    expect(onItemMenuSelectedMock).toHaveBeenCalled();
  });
});
