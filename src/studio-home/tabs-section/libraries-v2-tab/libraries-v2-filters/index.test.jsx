import React from 'react';
import {
  screen, fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LibrariesV2Filters from '.';

describe('LibrariesV2Filters', () => {
  const setIsFilteredMock = jest.fn();
  const setFilterParamsMock = jest.fn();
  const setCurrentPageMock = jest.fn();

  // eslint-disable-next-line react/prop-types
  const IntlProviderWrapper = ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  );

  const renderComponent = (overrideProps = {}) => render(
    <IntlProviderWrapper>
      <LibrariesV2Filters
        setIsFiltered={setIsFilteredMock}
        setFilterParams={setFilterParamsMock}
        setCurrentPage={setCurrentPageMock}
        {...overrideProps}
      />
    </IntlProviderWrapper>,

  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search field and order filter', () => {
    renderComponent();
    const searchInput = screen.getByTestId('input-filter-libraries-v2-search');
    expect(searchInput).toBeInTheDocument();
    const orderFilter = screen.getByTestId('dropdown-toggle-libraries-v2-order-menu');
    expect(orderFilter).toBeInTheDocument();
  });

  it('should call setIsFiltered, setFilterParams, setCurrentPage when search input changes', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(setIsFilteredMock).toHaveBeenCalled());
    await waitFor(() => expect(setFilterParamsMock).toHaveBeenCalled());
    await waitFor(() => expect(setCurrentPageMock).toHaveBeenCalled());
  });

  it('should call setIsFiltered, setFilterParams, setCurrentPage when a menu item order menu is selected', () => {
    renderComponent();
    const libraryV2OrderMenuFilter = screen.getByTestId('dropdown-toggle-libraries-v2-order-menu');
    fireEvent.click(libraryV2OrderMenuFilter);
    const newestLibV2sMenuItem = screen.getByTestId('item-menu-newest-libraries-v2');
    fireEvent.click(newestLibV2sMenuItem);
    expect(setIsFilteredMock).toHaveBeenCalled();
    expect(setFilterParamsMock).toHaveBeenCalled();
    expect(setCurrentPageMock).toHaveBeenCalled();
  });

  it('should clear the search input when filters cleared', async () => {
    const { rerender } = renderComponent({ isFiltered: true });
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(setIsFilteredMock).toHaveBeenCalled());
    await waitFor(() => expect(setFilterParamsMock).toHaveBeenCalled());
    await waitFor(() => expect(setCurrentPageMock).toHaveBeenCalled());

    rerender(
      <IntlProviderWrapper>
        <LibrariesV2Filters
          isFiltered={false}
          setIsFiltered={setIsFilteredMock}
          setFilterParams={setFilterParamsMock}
          setCurrentPage={setCurrentPageMock}
        />
      </IntlProviderWrapper>,
    );

    await waitFor(() => expect(screen.getByRole('searchbox').value).toBe(''));
  });

  it('should update states with the correct parameters when a order menu item is selected', () => {
    renderComponent();
    const libraryV2OrderMenuFilter = screen.getByTestId('dropdown-toggle-libraries-v2-order-menu');
    fireEvent.click(libraryV2OrderMenuFilter);
    const oldestLibV2sMenuItem = screen.getByTestId('item-menu-oldest-libraries-v2');
    fireEvent.click(oldestLibV2sMenuItem);

    // Check that setIsFiltered is called with `true`
    expect(setIsFilteredMock).toHaveBeenCalledWith(true);

    // Check that setFilterParams is called with the correct payload
    expect(setFilterParamsMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      search: '',
      order: 'created',
    }));

    // Check that setCurrentPage is called with `1`
    expect(setCurrentPageMock).toHaveBeenCalledWith(1);
  });

  it('should call setFilterParams after debounce delay when the search input changes', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(setFilterParamsMock).toHaveBeenCalled(), { timeout: 500 });
    expect(setFilterParamsMock).toHaveBeenCalledWith(expect.anything());
  });

  it('should not call setFilterParams when search only spaces', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    await waitFor(() => expect(setFilterParamsMock).not.toHaveBeenCalled(), { timeout: 500 });
    expect(setFilterParamsMock).not.toHaveBeenCalled();
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
