import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, renderHook } from '@testing-library/react';

import { TagTree } from './tagTree';
import { useEditActions, useTableModes } from './hooks';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
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
  const buildActions = (overrides = {}) => {
    const createTagMutation = { mutateAsync: jest.fn() };
    const setTagTree = jest.fn();
    const setDraftError = jest.fn();
    const enterPreviewMode = jest.fn();
    const setToast = jest.fn();
    const setIsCreatingTopTag = jest.fn();
    const setCreatingParentId = jest.fn();
    const exitDraftWithoutSave = jest.fn();
    const setEditingRowId = jest.fn();

    const params = {
      setTagTree,
      setDraftError,
      createTagMutation: createTagMutation as any,
      enterPreviewMode,
      setToast,
      setIsCreatingTopTag,
      setCreatingParentId,
      exitDraftWithoutSave,
      setEditingRowId,
      ...(overrides as any),
    };

    const { result } = renderHook(() => useEditActions(params), { wrapper });

    return {
      actions: result.current,
      createTagMutation,
      setTagTree,
      setDraftError,
      enterPreviewMode,
      setToast,
      setIsCreatingTopTag,
      setCreatingParentId,
      exitDraftWithoutSave,
      setEditingRowId,
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
    const { actions, enterPreviewMode, setToast, setEditingRowId } = buildActions();

    await act(async () => {
      await actions.handleUpdateTag('  same value  ', 'same value');
    });

    expect(enterPreviewMode).not.toHaveBeenCalled();
    expect(setToast).not.toHaveBeenCalled();
    expect(setEditingRowId).toHaveBeenCalledWith(null);
  });

  it('shows success toast and enters preview when update value changes', async () => {
    const { actions, enterPreviewMode, setToast, setEditingRowId } = buildActions();

    await act(async () => {
      await actions.handleUpdateTag('updated', 'original');
    });

    expect(enterPreviewMode).toHaveBeenCalled();
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: 'Tag "updated" updated successfully',
    });
    expect(setEditingRowId).toHaveBeenCalledWith(null);
  });

  it('keeps draft open and shows failure toast when createTag request fails', async () => {
    const { actions, createTagMutation, setDraftError, setToast } = buildActions();
    createTagMutation.mutateAsync.mockRejectedValue(new Error('server failed'));

    await act(async () => {
      await actions.handleCreateTag('new tag');
    });

    expect(setDraftError).toHaveBeenCalledWith('server failed');
    expect(setToast).toHaveBeenCalledWith({
      show: true,
      message: 'Error creating tag: server failed',
    });
  });
});
