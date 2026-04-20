import { Row } from '@openedx/paragon';
import { TreeRowData } from '@src/taxonomy/tree-table/types';
import { TagListRowData } from './types';

/** getTagListRowData
 *
 * Minimal getter function for `row.original`. Mainly because the naming of `original` is not expressive,
 * and it needs to be cast to the correct type.
 */
export const getTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);
