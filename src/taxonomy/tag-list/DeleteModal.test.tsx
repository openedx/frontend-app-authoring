import React from 'react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, within } from '@testing-library/react';

import { TreeTableContext } from '@src/taxonomy/tree-table';
import DeleteModal from './DeleteModal';

const createRow = (rowData) =>
  ({
    id: String(rowData.id),
    original: rowData,
  }) as any;

const leafRowData = {
  id: 101,
  value: 'leaf tag',
  depth: 0,
  childCount: 0,
  subRows: [],
};

const nestedRowData = {
  id: 201,
  value: 'parent tag',
  depth: 0,
  childCount: 1,
  subRows: [
    {
      id: 202,
      value: 'child tag',
      depth: 1,
      childCount: 1,
      subRows: [
        {
          id: 203,
          value: 'grandchild tag',
          depth: 2,
          childCount: 0,
          subRows: [],
        },
      ],
    },
  ],
};

const baseContextValue = (overrides = {}) => ({
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
  deleteRowMutation: {},
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
  confirmDeleteDialogOpen: true,
  setConfirmDeleteDialogOpen: jest.fn(),
  confirmDeleteDialogContext: createRow(leafRowData),
  setConfirmDeleteDialogContext: jest.fn(),
  handleDeleteRow: jest.fn(),
  startEditRow: jest.fn(),
  startDeleteRow: jest.fn(),
  table: null,
  ...overrides,
});

const renderDeleteModal = (contextValue = baseContextValue()) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <TreeTableContext.Provider value={contextValue as any}>
        <DeleteModal />
      </TreeTableContext.Provider>
    </IntlProvider>,
  );

describe('DeleteModal', () => {
  it('renders a singular delete title and "Delete Tag" action label when the selected row has no descendants', () => {
    renderDeleteModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Delete "leaf tag"');
    expect(dialog).toHaveTextContent('Warning! You are about to delete 1 tag(s).');
    expect(dialog).toHaveTextContent('Type DELETE to confirm');
    expect(within(dialog).getByRole('button', { name: 'Delete Tag' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders a plural delete action label and descendant warning copy when the selected row has one or more descendants', () => {
    renderDeleteModal(baseContextValue({ confirmDeleteDialogContext: createRow(nestedRowData) }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Delete "parent tag"');
    expect(dialog).toHaveTextContent('Warning! You are about to delete a tag containing sub-tags.');
    expect(dialog).toHaveTextContent('If you proceed, 3 tags will be deleted.');
    expect(dialog).toHaveTextContent('Type DELETE ALL 3 TAGS to confirm');
    expect(within(dialog).getByRole('button', { name: 'Delete Tags' })).toBeDisabled();
  });

  it('computes the required confirmation phrase from the recursive descendant count instead of only the immediate child count', () => {
    renderDeleteModal(baseContextValue({ confirmDeleteDialogContext: createRow(nestedRowData) }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('If you proceed, 3 tags will be deleted.');
    expect(dialog).toHaveTextContent('Type DELETE ALL 3 TAGS to confirm');
    expect(dialog).not.toHaveTextContent('DELETE ALL 2 TAGS');
  });

  it('calls handleDeleteRow with the dialog row context and then closes and clears the dialog state on confirm', async () => {
    const user = userEvent.setup();
    const row = createRow(leafRowData);
    const handleDeleteRow = jest.fn();
    const setConfirmDeleteDialogOpen = jest.fn();
    const setConfirmDeleteDialogContext = jest.fn();

    renderDeleteModal(baseContextValue({
      confirmDeleteDialogContext: row,
      handleDeleteRow,
      setConfirmDeleteDialogOpen,
      setConfirmDeleteDialogContext,
    }));

    await user.type(screen.getByRole('textbox'), 'DELETE');
    await user.click(screen.getByRole('button', { name: 'Delete Tag' }));

    expect(handleDeleteRow).toHaveBeenCalledWith(row);
    expect(setConfirmDeleteDialogOpen).toHaveBeenCalledWith(false);
    expect(setConfirmDeleteDialogContext).toHaveBeenCalledWith(null);
  });

  it('closes and clears the dialog context on cancel without invoking deletion', async () => {
    const user = userEvent.setup();
    const handleDeleteRow = jest.fn();
    const setConfirmDeleteDialogOpen = jest.fn();
    const setConfirmDeleteDialogContext = jest.fn();

    renderDeleteModal(baseContextValue({
      handleDeleteRow,
      setConfirmDeleteDialogOpen,
      setConfirmDeleteDialogContext,
    }));

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleDeleteRow).not.toHaveBeenCalled();
    expect(setConfirmDeleteDialogOpen).toHaveBeenCalledWith(false);
    expect(setConfirmDeleteDialogContext).toHaveBeenCalledWith(null);
  });
});
