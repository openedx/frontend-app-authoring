import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import TableBody from './TableBody';
import { TreeTableContext } from './TreeTableContext';

jest.mock('./CreateRow', () => () => (
  <tr data-testid="create-row">
    <td>Create row</td>
  </tr>
));

jest.mock('./EditRow', () => ({
  initialValue,
  handleUpdateRow,
  cancelEditRow,
}: {
  initialValue: string;
  handleUpdateRow: (value: string) => void;
  cancelEditRow: () => void;
}) => (
  <tr data-testid="edit-row">
    <td>{initialValue}</td>
    <td>
      <button onClick={() => handleUpdateRow('updated root')}>save edit</button>
    </td>
    <td>
      <button onClick={cancelEditRow}>cancel edit</button>
    </td>
  </tr>
));

jest.mock('./NestedRows', () => ({
  parentRowValue,
  isCreating,
  onSaveNewChildRow,
  onCancelCreation,
}: {
  parentRowValue: string;
  isCreating: boolean;
  onSaveNewChildRow: (value: string, parentRowValue?: string) => void;
  onCancelCreation: () => void;
}) => (
  <tr data-testid={`nested-rows-${parentRowValue}`}>
    <td>{parentRowValue}</td>
    <td>{String(isCreating)}</td>
    <td>
      <button onClick={() => onSaveNewChildRow('new child', parentRowValue)}>save child</button>
    </td>
    <td>
      <button onClick={onCancelCreation}>cancel child</button>
    </td>
  </tr>
));

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const baseContextValue = (): any => ({
  treeData: [],
  columns: [{ accessorKey: 'value', header: 'Tag name', cell: () => 'unused' }],
  pageCount: -1,
  pagination: { pageIndex: 0, pageSize: 10 },
  handlePaginationChange: jest.fn(),
  isLoading: false,
  isCreatingTopRow: false,
  draftError: '',
  createRowMutation: {},
  updateRowMutation: {},
  toast: { show: false, message: '', variant: 'success' as const },
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

const makeCell = (id: string, content: string) => ({
  id,
  column: { columnDef: { cell: () => content } },
  getContext: () => ({}),
});

const makeRow = ({
  id,
  value,
  depth = 0,
  subRows = [],
}: {
  id: number;
  value: string;
  depth?: number;
  subRows?: any[];
}) => ({
  id: String(id),
  depth,
  original: { id, value },
  subRows,
  getVisibleCells: () => [makeCell(`${id}-cell`, `${value} cell`)],
});

const renderTableBody = (contextValue = baseContextValue()) => render(
  <TreeTableContext.Provider value={contextValue as any}>
    <table>
      <TableBody />
    </table>
  </TreeTableContext.Provider>,
  { wrapper },
);

describe('TableBody', () => {
  it('returns null when no table instance is available in context', () => {
    const { container } = render(
      <table>
        <TableBody />
      </table>,
      { wrapper },
    );

    expect(container.querySelector('tbody')).toBeNull();
  });

  it('shows an empty-state row when the table has no rows', () => {
    const contextValue = baseContextValue();
    contextValue.table = {
      getRowModel: () => ({ rows: [] }),
    };

    renderTableBody(contextValue);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows a loading row when table data is still loading', () => {
    const contextValue = baseContextValue();
    contextValue.isLoading = true;
    contextValue.table = {
      getRowModel: () => ({ rows: [] }),
    };

    renderTableBody(contextValue);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders top-level creation and nested-row callbacks from context', () => {
    const contextValue = baseContextValue();
    const rootRow = makeRow({ id: 1, value: 'root tag' });

    contextValue.isCreatingTopRow = true;
    contextValue.creatingParentId = 1;
    contextValue.table = {
      getRowModel: () => ({ rows: [rootRow] }),
    };

    renderTableBody(contextValue);

    expect(screen.getByTestId('create-row')).toBeInTheDocument();
    expect(screen.getByText('root tag cell')).toBeInTheDocument();
    expect(screen.getByTestId('nested-rows-root tag')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button', { name: 'save child' }));
    expect(contextValue.handleCreateRow).toHaveBeenCalledWith('new child', 'root tag');

    fireEvent.click(screen.getByRole('button', { name: 'cancel child' }));
    expect(contextValue.setDraftError).toHaveBeenCalledWith('');
    expect(contextValue.setCreatingParentId).toHaveBeenCalledWith(null);
    expect(contextValue.exitDraftWithoutSave).toHaveBeenCalled();
  });

  it('renders edit mode for the matching row and wires save and cancel through context', () => {
    const contextValue = baseContextValue();
    const rootRow = makeRow({ id: 1, value: 'root tag' });

    contextValue.editingRowId = '1:root tag';
    contextValue.table = {
      getRowModel: () => ({ rows: [rootRow] }),
    };

    renderTableBody(contextValue);

    expect(screen.getByTestId('edit-row')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'save edit' }));
    expect(contextValue.handleUpdateRow).toHaveBeenCalledWith('updated root', 'root tag');

    fireEvent.click(screen.getByRole('button', { name: 'cancel edit' }));
    expect(contextValue.setEditingRowId).toHaveBeenCalledWith(null);
    expect(contextValue.exitDraftWithoutSave).toHaveBeenCalled();
  });
});
