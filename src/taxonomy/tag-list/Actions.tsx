import {
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Dropdown,
} from '@openedx/paragon';
import {
  AddCircle,
  MoreVert,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { Row } from '@tanstack/react-table';

import type {
  RowId,
  TreeRowData,
} from '@src/taxonomy/tree-table/types';
import type { TagListRowData } from './types';
import messages from './messages';

interface ActionsHeaderProps {
  onStartDraft: () => void;
  setDraftError: (error: string) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  setEditingRowId: (id: RowId | null) => void;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  disableTagActions: boolean;
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
  disableTagActions,
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
        disabled={disableTagActions || !canAddTag}
        aria-describedby={hasOpenDraft ? draftInProgressHintId : undefined}
      />
    </div>
  );
};

interface ActionsMenuProps {
  rowData: TagListRowData;
  startSubtagDraft: () => void;
  disableAddSubtag: boolean;
  startEditRow: () => void;
  disableEditRow: boolean;
  reachedMaxDepth: (row: Row<TreeRowData>) => boolean;
  startDeleteRow: (row: Row<TreeRowData>) => void;
  disableDeleteRow: boolean;
  row: Row<TreeRowData>;
}

const ActionsMenu = ({
  rowData,
  row,
  startSubtagDraft,
  disableAddSubtag,
  startEditRow,
  disableEditRow,
  reachedMaxDepth,
  startDeleteRow,
  disableDeleteRow,
}: ActionsMenuProps) => {
  const intl = useIntl();

  const deleteRowMenuItem = (
    <Dropdown.Item
      onClick={() => startDeleteRow(row)}
      disabled={disableDeleteRow}
    >
      {intl.formatMessage(messages.deleteTag)}
    </Dropdown.Item>
  );

  const editRowMenuItem = (
    <Dropdown.Item
      onClick={startEditRow}
      disabled={disableEditRow}
    >
      {intl.formatMessage(messages.renameTag)}
    </Dropdown.Item>
  );

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
        {editRowMenuItem}
        {deleteRowMenuItem}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Actions = {
  Header: ActionsHeader,
  Menu: ActionsMenu,
};

export default Actions;
