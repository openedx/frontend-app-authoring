import {
  Bubble,
} from '@openedx/paragon';
import type { Row } from '@tanstack/react-table';
import type {
  TreeRowData,
} from '../tree-table/types';

interface TagListRowData extends TreeRowData {
  depth: number;
  childCount: number;
  usageCount?: number;
  isNew?: boolean;
  isEditing?: boolean;
}

const asTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);

export const UsageCountDisplay = ({ row }: { row: Row<TreeRowData> }) => {
  const count = asTagListRowData(row).usageCount ?? 0;
  return (
    count > 0 && (
      <Bubble expandable>
        {count}
      </Bubble>
    )
  );
};
