import {
  Bubble,
} from '@openedx/paragon';
import type { Row } from '@tanstack/react-table';
import type {
  TreeRowData,
} from '@src/taxonomy/tree-table/types';
import type { TagListRowData } from './types';
import { getTagListRowData } from './utils';

const UsageCountDisplay = ({ row }: { row: Row<TreeRowData>; }) => {
  const count = getTagListRowData(row).usageCount ?? 0;

  if (count <= 0) {
    return null;
  }

  return (
    <Bubble expandable>
      {count}
    </Bubble>
  );
};

export default UsageCountDisplay;
