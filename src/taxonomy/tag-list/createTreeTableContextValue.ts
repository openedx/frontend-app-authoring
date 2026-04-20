import type { RowId } from '@src/taxonomy/tree-table/types';
import type { TreeTableContextValue } from '@src/taxonomy/tree-table/TreeTableContext';

import { getColumns } from './tagColumns';

interface CreateTagListTreeTableContextValueArgs extends Omit<TreeTableContextValue, 'columns'> {
  onStartDraft: () => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  canAddTag: boolean;
  maxDepth: number;
}

const createTreeTableContextValue = (
  args: CreateTagListTreeTableContextValueArgs,
): TreeTableContextValue => ({
  ...args,
  columns: getColumns(args),
});

export { createTreeTableContextValue };