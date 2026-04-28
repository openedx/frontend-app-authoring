import React from 'react';

import { getColumns } from './tagColumns';

const baseArgs = (overrides = {}) => ({
  setIsCreatingTopRow: jest.fn(),
  setEditingRowId: jest.fn(),
  onStartDraft: jest.fn(),
  setActiveActionMenuRowId: jest.fn(),
  hasOpenDraft: false,
  disableTagActions: false,
  canAddTag: true,
  setDraftError: jest.fn(),
  maxDepth: 3,
  startSubtagDraft: jest.fn(),
  startEditRow: jest.fn(),
  startDeleteRow: jest.fn(),
  ...overrides,
});

const getActionsColumn = (overrides = {}) => {
  const columns = getColumns(baseArgs(overrides));
  return columns.find(column => column.id === 'actions');
};

describe('tagColumns', () => {
  it('disables create, edit, and delete actions when tag actions are disabled', () => {
    const actionsColumn = getActionsColumn({ disableTagActions: true });

    if (!actionsColumn) {
      throw new Error('Actions column not found');
    }

    const headerElement = (actionsColumn.header as any)();
    const cellElement = (actionsColumn.cell as any)({
      row: {
        depth: 0,
        original: {
          id: 1,
          value: 'root',
          depth: 0,
          childCount: 0,
          canChangeTag: true,
          canDeleteTag: true,
        },
      },
    });
    const menuElement = React.Children.only(cellElement.props.children) as React.ReactElement;

    expect(headerElement.props.disableTagActions).toBe(true);
    expect(menuElement.props.disableAddSubtag).toBe(true);
    expect(menuElement.props.disableEditRow).toBe(true);
    expect(menuElement.props.disableDeleteRow).toBe(true);
  });
});
