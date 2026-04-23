import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import CreateRow from './CreateRow';
import { TreeTableContext } from './TreeTableContext';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const baseContextValue = () => ({
  treeData: [],
  columns: [],
  pageCount: -1,
  pagination: { pageIndex: 0, pageSize: 10 },
  handlePaginationChange: jest.fn(),
  isLoading: false,
  isCreatingTopRow: false,
  draftError: '',
  setDraftError: jest.fn(),
  handleCreateRow: jest.fn(),
  setIsCreatingTopRow: jest.fn(),
  exitDraftWithoutSave: jest.fn(),
  createRowMutation: { isPending: false },
  updateRowMutation: {},
  deleteRowMutation: {},
  toast: { show: false, message: '', variant: 'success' },
  setToast: jest.fn(),
  creatingParentId: null,
  setCreatingParentId: jest.fn(),
  validate: jest.fn((value: string) => value.trim().length > 0),
  handleUpdateRow: jest.fn(),
  editingRowId: null,
  setEditingRowId: jest.fn(),
  confirmDeleteDialogOpen: false,
  setConfirmDeleteDialogOpen: jest.fn(),
  confirmDeleteDialogContext: null,
  setConfirmDeleteDialogContext: jest.fn(),
  handleDeleteRow: jest.fn(),
  startEditRow: jest.fn(),
  startDeleteRow: jest.fn(),
  table: null,
});

describe('CreateRow', () => {
  it('saves on Enter when value is valid', () => {
    const contextValue = baseContextValue();
    render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <CreateRow />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  new tag  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(contextValue.handleCreateRow).toHaveBeenCalledWith('new tag');
  });

  it('does not save on Enter when mutation is pending', () => {
    const contextValue = baseContextValue();
    contextValue.createRowMutation = { isPending: true };

    render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <CreateRow />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'pending tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(contextValue.handleCreateRow).not.toHaveBeenCalled();
  });

  it('cancels on Escape and resets draft state', () => {
    const contextValue = baseContextValue();

    render(
      <TreeTableContext.Provider value={contextValue as any}>
        <table>
          <tbody>
            <CreateRow />
          </tbody>
        </table>
      </TreeTableContext.Provider>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'will cancel' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(contextValue.setDraftError).toHaveBeenCalledWith('');
    expect(contextValue.setIsCreatingTopRow).toHaveBeenCalledWith(false);
    expect(contextValue.exitDraftWithoutSave).toHaveBeenCalled();
  });
});
