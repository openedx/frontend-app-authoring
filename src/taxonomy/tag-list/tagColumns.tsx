import {
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  AddCircle,
  MoreVert,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import type { Row } from '@tanstack/react-table';

import type {
  RowId,
  TreeColumnDef,
  TreeRowData,
} from '@src/taxonomy/tree-table/types';
import type { TagListRowData } from './types';
import messages from './messages';
import OptionalExpandLink from './OptionalExpandLink';
import UsageCountDisplay from './UsageCountDisplay';
import { getTagListRowData } from './utils';

const EDITABLE_COLUMNS = ['value'];

interface GetColumnsArgs {
  setIsCreatingTopRow: (isCreating: boolean) => void;
  setCreatingParentId: (id: RowId | null) => void;
  setEditingRowId: (id: RowId | null) => void;
  onStartDraft: () => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  canAddTag: boolean;
  setDraftError: (error: string) => void;
  maxDepth: number;
}

interface ActionsHeaderProps {
  onStartDraft: () => void;
  setDraftError: (error: string) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  setEditingRowId: (id: RowId | null) => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  draftInProgressHintId: string;
  canAddTag: boolean;
}

const ActionsHeader = ({
  onStartDraft,
  setDraftError,
  setIsCreatingTopRow,
  setEditingRowId,
  setActiveActionMenuRowId,
  hasOpenDraft,
  canAddTag,
  draftInProgressHintId,
}: ActionsHeaderProps) => {
  const intl = useIntl();
  return (
    <div className="d-flex justify-content-end">
      <IconButtonWithTooltip
        tooltipPlacement="top"
        tooltipContent={<div>{intl.formatMessage(messages.createNewTagTooltip)}</div>}
        src={AddCircle}
        alt={intl.formatMessage(messages.createTagButtonLabel)}
        size="inline"
        onClick={() => {
          onStartDraft();
          setDraftError('');
          setIsCreatingTopRow(true);
          setEditingRowId(null);
          setActiveActionMenuRowId(null);
        }}
        disabled={hasOpenDraft || !canAddTag}
        aria-describedby={hasOpenDraft ? draftInProgressHintId : undefined}
      />
    </div>
  );
};

interface ActionsMenuProps {
  rowData: TagListRowData;
  startSubtagDraft: () => void;
  disableAddSubtag: boolean;
  editTag: () => void;
  disableEditTag: boolean;
  reachedMaxDepth: (row: Row<TreeRowData>) => boolean;
  deleteTag: () => void;
  disableDeleteTag: boolean;

  row: Row<TreeRowData>;
}

const ActionsMenu = ({
  rowData,
  row,
  startSubtagDraft,
  disableAddSubtag,
  editTag,
  disableEditTag,
  reachedMaxDepth,
  deleteTag,
  disableDeleteTag,
}: ActionsMenuProps) => {
  const intl = useIntl();

  const deleteTagMenuItem = (
    <Dropdown.Item
      onClick={deleteTag}
      disabled={disableDeleteTag}
    >
      {intl.formatMessage(messages.deleteTag)}
    </Dropdown.Item>
  )

  return (
    <Dropdown>
      <Dropdown.Toggle
        id={`dropdown-toggle-for-tag-${rowData.id}`}
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        aria-label={intl.formatMessage(messages.moreActionsForTag, { tagName: rowData.value })}
        size="sm"
      />
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={startSubtagDraft}
          disabled={reachedMaxDepth(row) || disableAddSubtag}
        >
          {intl.formatMessage(messages.addSubtag)}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={editTag}
          disabled={disableEditTag}
        >
          {intl.formatMessage(messages.renameTag)}
        </Dropdown.Item>
        {disableDeleteTag ? (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`tooltip-taxonomy-delete-tag-${rowData.id}`}>
                {intl.formatMessage(messages.deleteTagDisabledTooltip)}
              </Tooltip>
            }
          >
            {deleteTagMenuItem}
          </OverlayTrigger>
        ) : deleteTagMenuItem}
      </Dropdown.Menu>
    </Dropdown>
  );
};

function getColumns({
  setIsCreatingTopRow,
  setCreatingParentId,
  setEditingRowId,
  onStartDraft,
  setActiveActionMenuRowId,
  hasOpenDraft,
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
        <ActionsHeader
          onStartDraft={onStartDraft}
          setDraftError={setDraftError}
          setIsCreatingTopRow={setIsCreatingTopRow}
          setEditingRowId={setEditingRowId}
          setActiveActionMenuRowId={setActiveActionMenuRowId}
          hasOpenDraft={hasOpenDraft}
          draftInProgressHintId={draftInProgressHintId}
          canAddTag={canAddTag}
        />
      ),
      cell: ({ row }) => {
        const rowData = getTagListRowData(row);

        if (rowData.isNew || rowData.isEditing) {
          return <div className="d-flex gap-2" />;
        }

        const disableAddSubtag = hasOpenDraft || !canAddTag;
        const disableEditTag = hasOpenDraft || rowData.canChangeTag === false;
        const disableDeleteTag = hasOpenDraft || rowData.canDeleteTag === false;

        const startSubtagDraft = () => {
          onStartDraft();
          setDraftError('');
          setCreatingParentId(rowData.id);
          setEditingRowId(null);
          setIsCreatingTopRow(false);
          setActiveActionMenuRowId(null);
          row.toggleExpanded(true);
        };

        const editTag = () => {
          onStartDraft();
          setDraftError('');
          setEditingRowId(`${rowData.id}:${rowData.value}`);
          setCreatingParentId(null);
          setIsCreatingTopRow(false);
          setActiveActionMenuRowId(null);
        };

        const deleteTag = () => {
          // todo: implement
        };

        return (
          <div className="d-flex align-items-center justify-content-end gap-2">
            <ActionsMenu
              rowData={rowData}
              row={row}
              startSubtagDraft={startSubtagDraft}
              disableAddSubtag={disableAddSubtag}
              editTag={editTag}
              disableEditTag={disableEditTag}
              reachedMaxDepth={reachedMaxDepth}
              deleteTag={deleteTag}
              disableDeleteTag={disableDeleteTag}
            />
          </div>
        );
      },
    },
  ];
}

export { getColumns, EDITABLE_COLUMNS };
