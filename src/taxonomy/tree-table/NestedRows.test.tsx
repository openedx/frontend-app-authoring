import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import NestedRows from './NestedRows';
import { TreeTableContext } from './TreeTableContext';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const baseContextValue: any = () => ({
  treeData: [],
  columns: [],
  pageCount: -1,
  pagination: { pageIndex: 0, pageSize: 10 },
  handlePaginationChange: jest.fn(),
  isLoading: false,
  isCreatingTopRow: false,
  draftError: '',
  createRowMutation: {},
  updateRowMutation: {},
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

const makeCell = (id: string, content: string) => ({
  id,
  column: { columnDef: { cell: () => content } },
  getContext: () => ({}),
});

const makeRow = ({
  id,
  value,
  expanded = true,
  subRows = [],
}: {
  id: number;
  value: string;
  expanded?: boolean;
  subRows?: any[];
}) => ({
  id: String(id),
  original: { id, value },
  subRows,
  getIsExpanded: () => expanded,
  getVisibleCells: () => [makeCell(`${id}-cell`, value)],
});

describe('NestedRows', () => {
  it('renders nothing when parent row is collapsed', () => {
    const parent = makeRow({ id: 1, value: 'parent', expanded: false });
    const contextValue = baseContextValue();
    const { container } = render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <NestedRows
              parentRow={parent as any}
              parentRowValue="parent"
            />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    expect(container.querySelector('tr')).toBeNull();
  });

  it('resets creating parent and runs cancel callback for nested create row', () => {
    const nestedChild = makeRow({ id: 2, value: 'child', expanded: true });
    const parent = makeRow({
      id: 1,
      value: 'parent',
      expanded: true,
      subRows: [nestedChild],
    });
    const contextValue = baseContextValue();
    contextValue.setCreatingParentId = jest.fn();
    contextValue.creatingParentId = 2;
    contextValue.createRowMutation = { isPending: false };
    const onCancelCreation = jest.fn();

    render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <NestedRows
              parentRow={parent as any}
              parentRowValue="parent"
              childRowsData={[nestedChild as any]}
              onCancelCreation={onCancelCreation}
            />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(contextValue.setCreatingParentId).toHaveBeenCalledWith(null);
    expect(onCancelCreation).toHaveBeenCalled();
  });

  it('renders EditRow when editingRowId matches the child row id and value', () => {
    const nestedChild = makeRow({ id: 2, value: 'child', expanded: true });
    const parent = makeRow({
      id: 1,
      value: 'parent',
      expanded: true,
      subRows: [nestedChild],
    });

    const contextValue = baseContextValue();
    contextValue.editingRowId = '2:child';

    render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <NestedRows
              parentRow={parent as any}
              parentRowValue="parent"
              childRowsData={[nestedChild as any]}
            />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    const childInput = screen.getByDisplayValue('child');
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    expect(childInput).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});
