import {
  Bubble,
  Button,
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Dropdown,
} from '@openedx/paragon';
import {
  AddCircle,
  MoreVert,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import type { Row } from '@tanstack/react-table';

import messages from './messages';
import type {
  RowId,
  TreeColumnDef,
  TreeRowData,
} from '../tree-table/types';
import OptionalExpandLink from './OptionalExpandLink';

interface TagListRowData extends TreeRowData {
  depth: number;
  childCount: number;
  descendantCount: number;
  usageCount?: number;
  isNew?: boolean;
  isEditing?: boolean;
}

const asTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);

interface GetColumnsArgs {
  setIsCreatingTopTag: (isCreating: boolean) => void;
  setCreatingParentId: (id: RowId | null) => void;
  handleUpdateTag: (value: string, originalValue: string) => void;
  setEditingRowId: (id: RowId | null) => void;
  onStartDraft: () => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  draftError: string;
  setDraftError: (error: string) => void;
  isSavingDraft: boolean;
  maxDepth: number;
  creatingParentId: RowId | null;
}

const UsageCountDisplay = ({ row }: { row: Row<TreeRowData> }) => {
    const count = asTagListRowData(row).usageCount ?? 0
    return (count > 0 && <Bubble expandable={true}>
      {count}
    </Bubble>)
};
interface ActionsHeaderProps {
  onStartDraft: () => void;
  setDraftError: (error: string) => void;
  setIsCreatingTopTag: (isCreating: boolean) => void;
  setEditingRowId: (id: RowId | null) => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  draftInProgressHintId: string;
}

const ActionsHeader = ({
  onStartDraft,
  setDraftError,
  setIsCreatingTopTag,
  setEditingRowId,
  setActiveActionMenuRowId,
  hasOpenDraft,
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
          setIsCreatingTopTag(true);
          setEditingRowId(null);
          setActiveActionMenuRowId(null);
        }}
        disabled={hasOpenDraft}
        aria-describedby={hasOpenDraft ? draftInProgressHintId : undefined}
      />
    </div>
  );
};

interface ActionsMenuProps {
  rowData: TagListRowData;
  startSubtagDraft: () => void;
  disableAddSubtag: boolean;
}

const ActionsMenu = ({ rowData, startSubtagDraft, disableAddSubtag }: ActionsMenuProps) => {
  const intl = useIntl();

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
          as={Button}
          onClick={startSubtagDraft}
          disabled={disableAddSubtag}
        >
          {intl.formatMessage(messages.addSubtag)}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function getColumns({
  setIsCreatingTopTag,
  setCreatingParentId,
  setEditingRowId,
  onStartDraft,
  setActiveActionMenuRowId,
  hasOpenDraft,
  setDraftError,
  maxDepth,
  creatingParentId,
}: GetColumnsArgs): TreeColumnDef[] {
  const canAddSubtag = (row: Row<TreeRowData>) => row.depth < maxDepth;
  const draftInProgressHintId = 'tag-list-draft-in-progress-hint';

  return [
    {
      id: 'valueColumn',
      header: () => <FormattedMessage {...messages.tagListColumnValueHeader} />,
      cell: ({ row }) => {
        const {
          value,
        } = asTagListRowData(row);

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
      header: intl.formatMessage(messages.tagListColumnCountHeader),
      cell: UsageCountDisplay,
    },
    {
      id: 'actions',
      header: () => (
        <ActionsHeader
          onStartDraft={onStartDraft}
          setDraftError={setDraftError}
          setIsCreatingTopTag={setIsCreatingTopTag}
          setEditingRowId={setEditingRowId}
          setActiveActionMenuRowId={setActiveActionMenuRowId}
          hasOpenDraft={hasOpenDraft}
          draftInProgressHintId={draftInProgressHintId}
        />
      ),
      cell: ({ row }) => {
        const rowData = asTagListRowData(row);

        if (rowData.isNew || rowData.isEditing || !canAddSubtag(row)) {
          return <div className="d-flex gap-2" />;
        }

        const disableAddSubtag = hasOpenDraft && creatingParentId !== rowData.id;
        const startSubtagDraft = () => {
          onStartDraft();
          setDraftError('');
          setCreatingParentId(rowData.id);
          setEditingRowId(null);
          setIsCreatingTopTag(false);
          setActiveActionMenuRowId(null);
          row.toggleExpanded(true);
        };

        return (
          <div className="d-flex align-items-center justify-content-end gap-2">
            <ActionsMenu rowData={rowData} startSubtagDraft={startSubtagDraft} disableAddSubtag={disableAddSubtag} />
          </div>
        );
      },
    },
  ];
}

export { getColumns };
