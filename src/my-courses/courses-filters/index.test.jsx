import React from 'react';
import { useSelector } from 'react-redux';
import {
  screen, fireEvent, render, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CoursesFilters from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('CoursesFilters', () => {
  const dispatchMock = jest.fn();

  // eslint-disable-next-line react/prop-types
  const IntlProviderWrapper = ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  );

  const renderComponent = (overrideProps = {}) => render(
    <IntlProviderWrapper>
      <CoursesFilters
        dispatch={dispatchMock}
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
    const searchInput = screen.getByTestId('input-filter-courses-search');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render type courses menu and order curses menu', () => {
    renderComponent();
    const courseTypeMenuFilter = screen.getByTestId('dropdown-toggle-course-type-menu');
    const courseOrderMenuFilter = screen.getByTestId('dropdown-toggle-courses-order-menu');
    expect(courseTypeMenuFilter).toBeInTheDocument();
    expect(courseOrderMenuFilter).toBeInTheDocument();
  });

  it('should call dispatch when the search input changes', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(dispatchMock).toHaveBeenCalled());
  });

  it('should call dispatch when a menu item of course type menu is selected', () => {
    renderComponent();
    const courseTypeMenuFilter = screen.getByTestId('dropdown-toggle-course-type-menu');
    fireEvent.click(courseTypeMenuFilter);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);
    expect(dispatchMock).toHaveBeenCalled();
  });

  it('should call dispatch when a menu item of course order menu is selected', () => {
    renderComponent();
    const courseOrderMenuFilter = screen.getByTestId('dropdown-toggle-courses-order-menu');
    fireEvent.click(courseOrderMenuFilter);
    const descendantCoursesMenuItem = screen.getByTestId('item-menu-za-courses');
    fireEvent.click(descendantCoursesMenuItem);
    expect(dispatchMock).toHaveBeenCalled();
  });

  it('should clear the search input when cleanFilters is true', () => {
    useSelector.mockReturnValue({
      cleanFilters: true,
    });
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput.value).toBe('');
  });

  it('should call dispatch with the correct parameters when a menu item of course type menu is selected', () => {
    renderComponent();
    const courseTypeMenuFilter = screen.getByTestId('dropdown-toggle-course-type-menu');
    fireEvent.click(courseTypeMenuFilter);
    const activeCoursesMenuItem = screen.getByTestId('item-menu-active-courses');
    fireEvent.click(activeCoursesMenuItem);

    // Check that updateStudioHomeCoursesCustomParams is called with the correct payload
    expect(dispatchMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      payload: {
        currentPage: 1,
        search: '',
        order: 'display_name',
        isFiltered: true,
        archivedOnly: undefined,
        activeOnly: true,
        cleanFilters: false,
      },
    }));
  });

  it('should handle search input submission', () => {
    const handleSubmit = jest.fn();
    renderComponent({ onSubmitSearchField: handleSubmit });
    const searchInput = screen.getByRole('searchbox');
    userEvent.type(searchInput, 'testing{enter}');
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('should call dispatch after debounce delay when the search input changes', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(dispatchMock).toHaveBeenCalled(), { timeout: 500 });
    expect(dispatchMock).toHaveBeenCalledWith(expect.anything());
  });

  it('should not call dispatch when the search input contains only spaces', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    await waitFor(() => expect(dispatchMock).not.toHaveBeenCalled(), { timeout: 500 });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('should display the loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    const spinner = screen.getByTestId('loading-search-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should not display the loading spinner when isLoading is false', () => {
    renderComponent({ isLoading: false });
    const spinner = screen.queryByTestId('loading-search-spinner');
    expect(spinner).not.toBeInTheDocument();
  });

  it('should clear the search input and call dispatch when the reset button is clicked', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const form = searchInput.closest('form');
    const resetButton = form.querySelector('button[type="reset"]');
    fireEvent.click(resetButton);
    expect(searchInput.value).toBe('');
  });
});
