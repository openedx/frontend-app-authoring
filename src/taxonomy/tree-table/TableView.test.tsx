import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import { TreeTableContext } from './TreeTableContext';
import { TableView } from './TableView';

jest.mock('./TableBody', () => {
  const MockTableBody = () => (
    <tbody>
      <tr>
        <td>mock body</td>
      </tr>
    </tbody>
  );
  return MockTableBody;
});

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const baseContextValue = () => ({
  treeData: [{ id: 1, value: 'root' }],
  columns: [{ accessorKey: 'value', header: 'Tag name', cell: (info: any) => info.getValue() }],
  pageCount: 3,
  pagination: { pageIndex: 0, pageSize: 10 },
  handlePaginationChange: jest.fn(),
  isLoading: false,
  isCreatingTopRow: false,
  draftError: '',
  createRowMutation: { isPending: false, isError: false },
  updateRowMutation: { isPending: false, isError: false },
  toast: { show: false, message: '', variant: 'success' },
  setToast: jest.fn(),
  setIsCreatingTopRow: jest.fn(),
  exitDraftWithoutSave: jest.fn(),
  handleCreateRow: jest.fn(),
  creatingParentId: null,
  setCreatingParentId: jest.fn(),
  setDraftError: jest.fn(),
  validate: jest.fn(() => true),
  handleUpdateRow: jest.fn(),
  editingRowId: null,
  setEditingRowId: jest.fn(),
  table: null,
});

const renderTableView = (
  contextValue = baseContextValue(),
  props: React.ComponentProps<typeof TableView> = {},
) =>
  render(
    <TreeTableContext.Provider value={contextValue}>
      <TableView {...props} />
    </TreeTableContext.Provider>,
    { wrapper },
  );

describe('TableView', () => {
  it('shows and dismisses save error banner', () => {
    const contextValue = baseContextValue();
    contextValue.createRowMutation = { isPending: false, isError: true };
    contextValue.draftError = 'Request failed with status code 500';

    renderTableView(contextValue);

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Error saving changes')).not.toBeInTheDocument();
  });

  it('keeps pagination hidden by default even when multiple pages are reported', () => {
    renderTableView();

    expect(screen.queryByRole('navigation', { name: /table pagination/i })).not.toBeInTheDocument();
  });

  it('renders pagination and updates page selection when explicitly enabled', () => {
    const contextValue = baseContextValue();
    renderTableView(contextValue, { enablePagination: true });

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^page 2$/i }));
    expect(contextValue.handlePaginationChange).toHaveBeenCalled();
  });

  it('hides pagination when there is only one page', () => {
    const contextValue = baseContextValue();
    contextValue.pageCount = 1;
    renderTableView(contextValue);

    expect(screen.queryByRole('navigation', { name: /table pagination/i })).not.toBeInTheDocument();
  });

  it('closes toast by setting show to false', () => {
    const contextValue = baseContextValue();
    contextValue.toast = { show: true, message: 'created', variant: 'success' };

    renderTableView(contextValue);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(contextValue.setToast).toHaveBeenCalled();
    const updater = contextValue.setToast.mock.calls[0][0];
    expect(updater({ show: true, message: 'created', variant: 'success' })).toEqual({
      show: false,
      message: 'created',
      variant: 'success',
    });
  });

  it('shows the save error alert when a delete mutation fails and draftError is present', () => {
    const contextValue = baseContextValue();
    contextValue.draftError = 'Delete request failed';

    renderTableView(contextValue, { hasAdditionalError: true });

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(screen.getByText('Delete request failed. Please try again.')).toBeInTheDocument();
  });

  it('reopens the save error alert when a new delete error arrives after the user previously dismissed it', () => {
    const contextValue = baseContextValue();
    contextValue.draftError = 'First delete failure';

    const { rerender } = renderTableView(contextValue, { hasAdditionalError: true });

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Error saving changes')).not.toBeInTheDocument();

    const nextContextValue = baseContextValue();
    nextContextValue.draftError = 'Second delete failure';

    rerender(
      <TreeTableContext.Provider value={nextContextValue}>
        <TableView hasAdditionalError />
      </TreeTableContext.Provider>,
    );

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(screen.getByText('Second delete failure. Please try again.')).toBeInTheDocument();
  });
});
