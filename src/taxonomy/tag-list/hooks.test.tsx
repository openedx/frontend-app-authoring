import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, renderHook, waitFor } from '@testing-library/react';

import { TagTree } from './tagTree';
import { useEditActions, useTableModes } from './hooks';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

describe('useTableModes', () => {
  it('supports valid transitions from view to draft to preview', () => {
    const { result } = renderHook(() => useTableModes());

    expect(result.current.tableMode).toEqual('view');

    act(() => {
      result.current.enterDraftMode();
    });
    expect(result.current.tableMode).toEqual('draft');

    act(() => {
      result.current.enterPreviewMode();
    });
    expect(result.current.tableMode).toEqual('preview');
  });

  it('throws when transition is invalid for the current mode', () => {
    const { result } = renderHook(() => useTableModes());

    act(() => {
      result.current.enterDraftMode();
    });

    expect(() => {
      act(() => {
        result.current.enterViewMode();
      });
    }).toThrow('Invalid table mode transition from draft to view');
  });
});

describe('useEditActions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const buildActions = (overrides = {}) => {
    const createTagMutation = { mutateAsync: jest.fn() };
    const updateTagMutation = { mutateAsync: jest.fn() };
    const deleteTagMutation = { mutateAsync: jest.fn() };
    const setTagTree = jest.fn();
    const setDraftError = jest.fn();
    const enterDraftMode = jest.fn();
    const enterPreviewMode = jest.fn();
    const enterViewMode = jest.fn();
    const setToast = jest.fn();
    const setIsCreatingTopTag = jest.fn();
    const setCreatingParentId = jest.fn();
    const exitDraftWithoutSave = jest.fn();
    const setEditingRowId = jest.fn();
    const setActiveActionMenuRowId = jest.fn();

    const params = {
      setTagTree,
      setDraftError,
      createTagMutation: createTagMutation as any,
      enterDraftMode,
      enterPreviewMode,
      enterViewMode,
      setToast,
      setIsCreatingTopTag,
      setCreatingParentId,
      exitDraftWithoutSave,
      setEditingRowId,
      updateTagMutation: updateTagMutation as any,
      deleteTagMutation: deleteTagMutation as any,
      setActiveActionMenuRowId,
      ...(overrides as any),
    };

    const { result } = renderHook(() => useEditActions(params), { wrapper });

    return {
      actions: result.current,
      createTagMutation,
      deleteTagMutation,
      setTagTree,
      setDraftError,
      enterDraftMode,
      enterPreviewMode,
      enterViewMode,
      setToast,
      setIsCreatingTopTag,
      setCreatingParentId,
      exitDraftWithoutSave,
      setEditingRowId,
      setActiveActionMenuRowId,
    };
  };

  it('throws inline validation error in hard mode for invalid characters', () => {
    const { actions } = buildActions();
    expect(() => actions.validate('invalid;tag', 'hard')).toThrow('Invalid character in tag name');
  });

  it('sets an inline validation error and returns false in soft mode', () => {
    const { actions, setDraftError } = buildActions();

    const isValid = actions.validate('   ', 'soft');

    expect(isValid).toBe(false);
    expect(setDraftError).toHaveBeenCalledWith('Name is required');
  });

  it('adds a new root node when table data is initially empty', () => {
    let updatedTree: any = null;
    const setTagTree = jest.fn((updater: (current: TagTree | null) => TagTree) => {
      updatedTree = updater(null);
    });

    const { actions } = buildActions({ setTagTree });
    act(() => {
      actions.updateTableWithoutDataReload('brand new root');
    });

    expect(updatedTree.getTagAsDeepCopy('brand new root')).not.toBeNull();
  });

  it('does not transition to preview when update value is unchanged after trimming', async () => {
    const {
      actions,
      enterPreviewMode,
      setToast,
      setEditingRowId,
    } = buildActions();

    await act(async () => {
      await actions.handleUpdateRow('  same value  ', 'same value');
    });

    expect(enterPreviewMode).not.toHaveBeenCalled();
    expect(setToast).not.toHaveBeenCalled();
    expect(setEditingRowId).toHaveBeenCalledWith(null);
  });

  it('shows success toast and enters preview when update value changes', async () => {
    const {
      actions,
      enterPreviewMode,
      setToast,
      setEditingRowId,
    } = buildActions();

    await act(async () => {
      await actions.handleUpdateRow('updated', 'original');
    });

    await waitFor(() => {
      expect(enterPreviewMode).toHaveBeenCalled();
    });
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: 'Tag "updated" updated successfully',
    });
    expect(setEditingRowId).toHaveBeenCalledWith(null);
  });

  it('keeps draft open and shows failure toast when createRow request fails', async () => {
    const { actions, createTagMutation, setDraftError, setToast } = buildActions();
    createTagMutation.mutateAsync.mockRejectedValue(new Error('server failed'));

    await act(async () => {
      await actions.handleCreateRow('new tag');
    });

    expect(setDraftError).toHaveBeenCalledWith('server failed');
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: 'Error creating tag: server failed',
    });
  });

  it('enters view mode only after a delete request succeeds', async () => {
    const {
      actions,
      deleteTagMutation,
      enterViewMode,
      setToast,
    } = buildActions();
    deleteTagMutation.mutateAsync.mockResolvedValue(undefined);

    actions.handleDeleteRow({
      original: {
        id: 1,
        value: 'tag to delete',
        depth: 0,
        childCount: 0,
      },
    } as any);

    await waitFor(() => {
      expect(enterViewMode).toHaveBeenCalled();
    });
    expect(deleteTagMutation.mutateAsync).toHaveBeenCalledWith({
      value: 'tag to delete',
      withSubtags: false,
    });
    expect(deleteTagMutation.mutateAsync.mock.invocationCallOrder[0]).toBeLessThan(
      enterViewMode.mock.invocationCallOrder[0],
    );
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: '1 tag(s) deleted. This change will be applied across all tagged content.',
    });
  });

  it('does not enter view mode when a delete request fails', async () => {
    const {
      actions,
      deleteTagMutation,
      enterViewMode,
      setDraftError,
      setToast,
    } = buildActions();
    deleteTagMutation.mutateAsync.mockRejectedValue(new Error('server failed'));

    actions.handleDeleteRow({
      original: {
        id: 1,
        value: 'tag to delete',
        depth: 0,
        childCount: 0,
      },
    } as any);

    await waitFor(() => {
      expect(setDraftError).toHaveBeenCalledWith('server failed');
    });
    expect(enterViewMode).not.toHaveBeenCalled();
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: 'Error deleting tag: server failed',
    });
  });
});
