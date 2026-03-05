import React from 'react';
import {
  Button,
  Icon,
  IconButton,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import {
  AddCircle,
  MoreVert,
  ExpandMore,
  ExpandLess,
} from '@openedx/paragon/icons';
import type { Row } from '@tanstack/react-table';
import type { IntlShape } from 'react-intl';

import messages from './messages';
import type {
  RowId,
  TreeColumnDef,
  TreeRowData,
} from '../tree-table/types';
import { EditableCell } from '../tree-table';

interface TagListRowData extends TreeRowData {
  depth: number;
  childCount: number;
  descendantCount: number;
  isNew?: boolean;
  isEditing?: boolean;
}

const asTagListRowData = (row: Row<TreeRowData>): TagListRowData => (
  row.original as unknown as TagListRowData
);

interface GetColumnsArgs {
  intl: IntlShape;
  handleCreateTag: (value: string, parentTagValue?: string) => void;
  setIsCreatingTopTag: (isCreating: boolean) => void;
  setCreatingParentId: (id: RowId | null) => void;
  handleUpdateTag: (value: string, originalValue: string) => void;
  setEditingRowId: (id: RowId | null) => void;
  onStartDraft: () => void;
  activeActionMenuRowId: RowId | null;
  setActiveActionMenuRowId: (id: RowId | null) => void;
  hasOpenDraft: boolean;
  draftError: string;
  setDraftError: (error: string) => void;
  isSavingDraft: boolean;
  maxDepth: number;
  creatingParentId: RowId | null;
}

const OptionalExpandLink = ({ row }: { row: Row<TreeRowData> }) => (
  <IconButton
    src={row.getIsExpanded() ? ExpandLess : ExpandMore}
    onClick={row.getToggleExpandedHandler()}
    alt="Show Subtags"
    size="sm"
    style={{ visibility: row.getCanExpand() ? 'visible' : 'hidden' }}
  />
);

function getColumns({
  intl,
  handleCreateTag,
  setIsCreatingTopTag,
  setCreatingParentId,
  handleUpdateTag,
  setEditingRowId,
  onStartDraft,
  activeActionMenuRowId,
  setActiveActionMenuRowId,
  hasOpenDraft,
  draftError,
  setDraftError,
  isSavingDraft,
  maxDepth,
  creatingParentId,
}: GetColumnsArgs): TreeColumnDef[] {
  const canAddSubtag = (row: Row<TreeRowData>) => row.depth + 1 < maxDepth;

  return [
    {
      header: intl.formatMessage(messages.tagListColumnValueHeader),
      cell: ({ row }: { row: Row<TreeRowData> }) => {
        const {
          isNew,
          isEditing,
          value,
          descendantCount,
        } = asTagListRowData(row);

        if (isNew) {
          return (
            <EditableCell
              errorMessage={draftError}
              isSaving={isSavingDraft}
              onSave={(newValue) => handleCreateTag(newValue)}
              onCancel={() => {
                setDraftError('');
                setIsCreatingTopTag(false);
              }}
            />
          );
        }

        if (isEditing) {
          return (
            <EditableCell
              initialValue={value}
              errorMessage={draftError}
              onSave={(newVal) => handleUpdateTag(newVal, value)}
              onCancel={() => {
                setDraftError('');
                setEditingRowId(null);
              }}
            />
          );
        }

        return (
          <span className="d-flex align-items-center gap-2">
            <OptionalExpandLink row={row} />
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      id: 'add',
      header: () => (
        <IconButtonWithTooltip
          tooltipPlacement="top"
          tooltipContent={<div>Create a new tag</div>}
          src={AddCircle}
          alt="Create Tag"
          size="inline"
          onClick={() => {
            onStartDraft();
            setDraftError('');
            setIsCreatingTopTag(true);
            setEditingRowId(null);
            setActiveActionMenuRowId(null);
          }}
          disabled={hasOpenDraft}
        />
      ),
      cell: ({ row }: { row: Row<TreeRowData> }) => {
        const rowData = asTagListRowData(row);

        if (rowData.isNew) {
          return <div className="d-flex gap-2" />;
        }

        const isMenuOpen = activeActionMenuRowId === rowData.id;
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
          <div className="d-flex align-items-center gap-2">
            <IconButton
              src={MoreVert}
              alt="Actions"
              iconAs={Icon}
              onClick={() => {
                setActiveActionMenuRowId(isMenuOpen ? null : rowData.id);
              }}
              disabled={disableAddSubtag}
            />
            {isMenuOpen && canAddSubtag(row) && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={startSubtagDraft}
                disabled={disableAddSubtag}
              >
                {intl.formatMessage(messages.addSubtag)}
              </Button>
            )}
          </div>
        );
      },
    },
    // {
    //   id: 'edit',
    //   cell: ({ row }) => {
    //     if (row.original.isNew) {
    //       return <div className="d-flex gap-2"></div>;
    //     }

    //     return (
    //       <div className="d-flex gap-2">
    //         <span
    //           style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3', marginRight: '1rem' }}
    //           onClick={() => {
    //             setEditingRowId(row.original.id);
    //             setCreatingParentId(null);
    //           } }
    //         >
    //           Edit
    //         </span>
    //       </div>
    //     );
    //   }
    // },
  ];
}

export { getColumns };
