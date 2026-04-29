import React, { useContext, useEffect } from 'react';
import { render, screen } from '@testing-library/react';

import { TreeTableContext } from './TreeTableContext';

const ContextProbe = () => {
  const context = useContext(TreeTableContext);

  useEffect(() => {
    context.handlePaginationChange({ pageIndex: 1, pageSize: 25 });
    context.setToast((prevToast) => ({ ...prevToast, show: true }));
    context.setIsCreatingTopRow(true);
    context.exitDraftWithoutSave();
    context.handleCreateRow('new tag', 'parent tag');
    context.setCreatingParentId(123);
    context.setDraftError('Draft error');
    context.handleUpdateRow('updated tag', 'original tag');
    context.setEditingRowId(456);
  }, [context]);

  return (
    <>
      <span data-testid="page-count">{String(context.pageCount)}</span>
      <span data-testid="pagination">
        {`${context.pagination.pageIndex}:${context.pagination.pageSize}`}
      </span>
      <span data-testid="is-loading">{String(context.isLoading)}</span>
      <span data-testid="is-creating-top-row">{String(context.isCreatingTopRow)}</span>
      <span data-testid="draft-error">{context.draftError}</span>
      <span data-testid="create-row-mutation">{JSON.stringify(context.createRowMutation)}</span>
      <span data-testid="update-row-mutation">{JSON.stringify(context.updateRowMutation)}</span>
      <span data-testid="toast">{JSON.stringify(context.toast)}</span>
      <span data-testid="creating-parent-id">{String(context.creatingParentId)}</span>
      <span data-testid="editing-row-id">{String(context.editingRowId)}</span>
      <span data-testid="table-is-null">{String(context.table === null)}</span>
      <span data-testid="validate-result">{String(context.validate('tag value', 'hard'))}</span>
    </>
  );
};

describe('TreeTableContext', () => {
  it('provides safe default values and no-op handlers when no provider is present', () => {
    render(<ContextProbe />);

    expect(screen.getByTestId('page-count')).toHaveTextContent('-1');
    expect(screen.getByTestId('pagination')).toHaveTextContent('0:0');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-creating-top-row')).toHaveTextContent('false');
    expect(screen.getByTestId('draft-error')).toBeEmptyDOMElement();
    expect(screen.getByTestId('create-row-mutation')).toHaveTextContent('{}');
    expect(screen.getByTestId('update-row-mutation')).toHaveTextContent('{}');
    expect(screen.getByTestId('toast')).toHaveTextContent(
      '{"show":false,"message":"","variant":"success"}',
    );
    expect(screen.getByTestId('creating-parent-id')).toHaveTextContent('null');
    expect(screen.getByTestId('editing-row-id')).toHaveTextContent('null');
    expect(screen.getByTestId('table-is-null')).toHaveTextContent('true');
    expect(screen.getByTestId('validate-result')).toHaveTextContent('true');
  });
});
