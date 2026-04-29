import type { Row } from '@tanstack/react-table';
import type { TreeRowData } from '@src/taxonomy/tree-table/types';
import type { TagListRowData } from './types';

/** getTagListRowData
 *
 * Minimal getter function for `row.original`. Mainly because the naming of `original` is not expressive,
 * and it needs to be cast to the correct type.
 */
export const getTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);

/**
 * Counts this tag and every nested descendant below it.
 *
 * A leaf tag counts as 1. For parent tags, start with 1 for the tag itself,
 * then recursively add the same count for each child in `subRows`.
 */
export const getTagWithDescendantsCount = (rowData: TreeRowData): number => {
  if (!rowData.subRows || rowData.subRows.length === 0) {
    return 1;
  }
  return rowData.subRows.reduce((count, subRow) => count + getTagWithDescendantsCount(subRow), 1);
};
