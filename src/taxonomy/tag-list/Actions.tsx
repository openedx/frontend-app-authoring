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
  startEditTag: () => void;
  disableEditTag: boolean;
  reachedMaxDepth: (row: Row<TreeRowData>) => boolean;
  startDeleteTag: (row: Row<TreeRowData>) => void;
  disableDeleteTag: boolean;
  row: Row<TreeRowData>;
}

const ActionsMenu = ({
  rowData,
  row,
  startSubtagDraft,
  disableAddSubtag,
  startEditTag,
  disableEditTag,
  reachedMaxDepth,
  startDeleteTag,
  disableDeleteTag,
}: ActionsMenuProps) => {
  const intl = useIntl();

  const deleteTagMenuItem = (
    <Dropdown.Item
      onClick={() => startDeleteTag(row)}
      disabled={disableDeleteTag}
    >
      {intl.formatMessage(messages.deleteTag)}
    </Dropdown.Item>
  );

  const editTagMenuItem = (
    <Dropdown.Item
      onClick={startEditTag}
      disabled={disableEditTag}
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
        {editTagMenuItem}
        {deleteTagMenuItem}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Actions = {
  Header: ActionsHeader,
  Menu: ActionsMenu,
};

export default Actions;
