import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import NestedRows from './NestedRows';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const defaultRequiredProps = {
  setIsCreatingTopRow: jest.fn(),
  createRowMutation: {},
  updateRowMutation: {},
  handleUpdateRow: jest.fn(),
  editingRowId: null,
  setEditingRowId: jest.fn(),
  exitDraftWithoutSave: jest.fn(),
  validate: () => true,
};

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
    const { container } = render(
      <table>
        <tbody>
          <NestedRows
            parentRow={parent as any}
            parentRowValue="parent"
            {...defaultRequiredProps}
          />
        </tbody>
      </table>,
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
    const setCreatingParentId = jest.fn();
    const onCancelCreation = jest.fn();

    render(
      <table>
        <tbody>
          <NestedRows
            parentRow={parent as any}
            parentRowValue="parent"
            childRowsData={[nestedChild as any]}
            creatingParentId={2}
            setCreatingParentId={setCreatingParentId}
            onCancelCreation={onCancelCreation}
            {...defaultRequiredProps}
            createRowMutation={{ isPending: false }}
          />
        </tbody>
      </table>,
      { wrapper },
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(setCreatingParentId).toHaveBeenCalledWith(null);
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

    render(
      <table>
        <tbody>
          <NestedRows
            parentRow={parent as any}
            parentRowValue="parent"
            childRowsData={[nestedChild as any]}
            {...defaultRequiredProps}
            editingRowId="2:child"
          />
        </tbody>
      </table>,
      { wrapper },
    );

    const childInput = screen.getByDisplayValue('child');
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    expect(childInput).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});
