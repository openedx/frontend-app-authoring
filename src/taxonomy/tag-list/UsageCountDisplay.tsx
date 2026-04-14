import {
  Bubble,
} from '@openedx/paragon';
import type { Row } from '@tanstack/react-table';
import type {
  TreeRowData,
} from '@src/taxonomy/tree-table/types';
import { TagListRowData } from './types';

const asTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);

const UsageCountDisplay = ({ row }: { row: Row<TreeRowData> }) => {
  const count = asTagListRowData(row).usageCount ?? 0;
  return (
    count > 0 && (
      <Bubble expandable>
        {count}
      </Bubble>
    )
  );
};

export default UsageCountDisplay;
