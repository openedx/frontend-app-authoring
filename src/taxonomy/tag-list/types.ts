import { TreeRowData } from '../tree-table/types';

export interface TagListRowData extends TreeRowData {
  depth: number;
  childCount: number;
  usageCount?: number;
  isNew?: boolean;
  isEditing?: boolean;
}
