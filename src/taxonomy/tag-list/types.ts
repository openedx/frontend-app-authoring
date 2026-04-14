import { TreeRowData } from '@src/taxonomy/tree-table/types';

export interface TagListRowData extends TreeRowData {
  depth: number;
  childCount: number;
  usageCount?: number;
  isNew?: boolean;
  isEditing?: boolean;
}
