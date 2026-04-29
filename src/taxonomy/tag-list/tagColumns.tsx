import { FormattedMessage } from '@edx/frontend-platform/i18n';
import type { Row } from '@tanstack/react-table';

import type {
  RowId,
  TreeColumnDef,
  TreeRowData,
} from '@src/taxonomy/tree-table/types';
import messages from './messages';
import OptionalExpandLink from './OptionalExpandLink';
import UsageCountDisplay from './UsageCountDisplay';
import { getTagListRowData } from './utils';
import Actions from './Actions';

const EDITABLE_COLUMNS = ['value'];

interface GetColumnsArgs {
  setIsCreatingTopRow: (isCreating: boolean) => void;
  setEditingRowId: (id: RowId | null) => void;
  onStartDraft: () => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  disableTagActions: boolean;
  canAddTag: boolean;
  setDraftError: (error: string) => void;
  maxDepth: number;
  startSubtagDraft: (row: Row<TreeRowData>) => void;
  startEditRow: (row: Row<TreeRowData>) => void;
  startDeleteRow: (row: Row<TreeRowData>) => void;
}

function getColumns({
  setIsCreatingTopRow,
  setEditingRowId,
  onStartDraft,
  startSubtagDraft,
  startEditRow,
  startDeleteRow,
  setActiveActionMenuRowId,
  hasOpenDraft,
  disableTagActions,
  canAddTag,
  setDraftError,
  maxDepth,
}: GetColumnsArgs): TreeColumnDef[] {
  const reachedMaxDepth = (row: Row<TreeRowData>) => row.depth >= maxDepth;
  const draftInProgressHintId = 'tag-list-draft-in-progress-hint';

  return [
    {
      id: 'valueColumn',
      header: () => <FormattedMessage {...messages.tagListColumnValueHeader} />,
      cell: ({ row }) => {
        const {
          value,
        } = getTagListRowData(row);

        return (
          <span className="d-flex align-items-center gap-2">
            <OptionalExpandLink row={row} />
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      id: 'count',
      header: () => <FormattedMessage {...messages.tagListColumnCountHeader} />,
      cell: UsageCountDisplay,
    },
    {
      id: 'actions',
      header: () => (
        <Actions.Header
          onStartDraft={onStartDraft}
          setDraftError={setDraftError}
          setIsCreatingTopRow={setIsCreatingTopRow}
          setEditingRowId={setEditingRowId}
          setActiveActionMenuRowId={setActiveActionMenuRowId}
          hasOpenDraft={hasOpenDraft}
          disableTagActions={disableTagActions}
          draftInProgressHintId={draftInProgressHintId}
          canAddTag={canAddTag}
        />
      ),
      cell: ({ row }) => {
        const rowData = getTagListRowData(row);

        if (rowData.isNew || rowData.isEditing) {
          return <div className="d-flex gap-2" />;
        }

        const disableAddSubtag = disableTagActions || !canAddTag;
        const disableEditRow = disableTagActions || rowData.canChangeTag === false;
        const disableDeleteRow = disableTagActions || rowData.canDeleteTag === false;

        return (
          <div className="d-flex align-items-center justify-content-end gap-2">
            <Actions.Menu
              rowData={rowData}
              row={row}
              startSubtagDraft={() => startSubtagDraft(row)}
              disableAddSubtag={disableAddSubtag}
              startEditRow={() => startEditRow(row)}
              disableEditRow={disableEditRow}
              reachedMaxDepth={reachedMaxDepth}
              startDeleteRow={() => startDeleteRow(row)}
              disableDeleteRow={disableDeleteRow}
            />
          </div>
        );
      },
    },
  ];
}

export { getColumns, EDITABLE_COLUMNS };
