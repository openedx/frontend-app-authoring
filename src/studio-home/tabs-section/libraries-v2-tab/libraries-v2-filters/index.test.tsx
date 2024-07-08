import React from 'react';
import {
  screen, fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LibrariesV2Filters, { LibrariesV2FiltersProps } from '.';

describe('LibrariesV2Filters', () => {
  const setFilterParamsMock = jest.fn();
  const setCurrentPageMock = jest.fn();

  const IntlProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  );

  const renderComponent = (overrideProps: Partial<LibrariesV2FiltersProps> = {}) => render(
    <IntlProviderWrapper>
      <LibrariesV2Filters
        filterParams={{}}
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
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();
    const orderFilter = screen.getByText('Name A-Z');
    expect(orderFilter).toBeInTheDocument();
  });

  it('should call setFilterParams and setCurrentPage when search input changes', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(setFilterParamsMock).toHaveBeenCalled());
    await waitFor(() => expect(setCurrentPageMock).toHaveBeenCalled());
  });

  it('should call setFilterParams and setCurrentPage when a menu item order menu is selected', async () => {
    renderComponent();
    const libraryV2OrderMenuFilter = screen.getByText('Name A-Z');
    fireEvent.click(libraryV2OrderMenuFilter);
    const newestLibV2sMenuItem = screen.getByText('Newest');
    fireEvent.click(newestLibV2sMenuItem);
    expect(setFilterParamsMock).toHaveBeenCalled();
    expect(setCurrentPageMock).toHaveBeenCalled();
  });

  it('should clear the search input when filters cleared', async () => {
    const { rerender } = renderComponent({ isFiltered: true });
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => expect(setFilterParamsMock).toHaveBeenCalled());
    await waitFor(() => expect(setCurrentPageMock).toHaveBeenCalled());

    rerender(
      <IntlProviderWrapper>
        <LibrariesV2Filters
          isFiltered={false}
          filterParams={{}}
          setFilterParams={setFilterParamsMock}
          setCurrentPage={setCurrentPageMock}
        />
      </IntlProviderWrapper>,
    );

    await waitFor(() => expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(''));
  });

  it('should update states with the correct parameters when a order menu item is selected', () => {
    renderComponent();
    const libraryV2OrderMenuFilter = screen.getByText('Name A-Z');
    fireEvent.click(libraryV2OrderMenuFilter);
    const oldestLibV2sMenuItem = screen.getByText('Oldest');
    fireEvent.click(oldestLibV2sMenuItem);

    // Check that setFilterParams is called with the correct payload
    expect(setFilterParamsMock).toHaveBeenCalledWith(expect.objectContaining({
      search: undefined,
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

  it('should not call setFilterParams with only spaces when search only spaces', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: '   ' } });

    await waitFor(() => expect(setFilterParamsMock).not.toHaveBeenCalledWith(expect.objectContaining({
      search: '   ',
      order: 'created',
    })), { timeout: 500 });
  });

  it('should display the loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    const spinner = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
  });

  it('should not display the loading spinner when isLoading is false', () => {
    renderComponent({ isLoading: false });
    const spinner = screen.queryByText('Loading...');
    expect(spinner).not.toBeInTheDocument();
  });

  it('should clear the search input and call dispatch when the reset button is clicked', async () => {
    renderComponent();
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });
    const form = searchInput.closest('form');
    if (!form) {
      throw new Error('Form not found');
    }
    const resetButton = form.querySelector('button');
    if (!resetButton || !(resetButton instanceof HTMLButtonElement)) {
      throw new Error('Reset button not found');
    }
    fireEvent.click(resetButton);
    expect(searchInput.value).toBe('');
  });
});
