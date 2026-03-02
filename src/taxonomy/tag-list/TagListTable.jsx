// @ts-check
import React, { useState, useMemo, useEffect, useReducer } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Toast,
  Card,
  ActionRow,
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Spinner,
  Pagination,
} from '@openedx/paragon';
import { AddCircle, MoreVert } from '@openedx/paragon/icons';
import { isEqual, set } from 'lodash';
import Proptypes from 'prop-types';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { LoadingSpinner } from '../../generic/Loading';
import messages from './messages';
import { useTagListData, useSubTags, useCreateTag } from '../data/apiHooks';
import { TagTree } from './tagTree';
import EditableTreeTableDisplay from './EditableTreeTableDisplay';

// State machine for table modes

const TABLE_MODES = {
  VIEW: 'view',
  DRAFT: 'draft',
  PREVIEW: 'preview',
}

const TRANSITION_TABLE = {
  [TABLE_MODES.VIEW]: [TABLE_MODES.DRAFT],
  [TABLE_MODES.DRAFT]: [TABLE_MODES.PREVIEW],
  [TABLE_MODES.PREVIEW]: [TABLE_MODES.DRAFT, TABLE_MODES.VIEW],
}

const TABLE_MODE_ACTIONS = {
  TRANSITION: 'transition',
};

const TAG_NAME_PATTERN = /^[\w\- ]+$/;

const getInlineValidationMessage = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Name is required';
  }
  if (!TAG_NAME_PATTERN.test(trimmed)) {
    return 'Invalid character in tag name';
  }
  return '';
};

/** @type {import('react').Reducer<string, { type: string, targetMode: string }>} */
const tableModeReducer = (currentMode, action) => {
  if (action?.type !== TABLE_MODE_ACTIONS.TRANSITION) {
    throw new Error(`Unknown table mode action: ${action?.type}`);
  }

  const { targetMode } = action;
  if (TRANSITION_TABLE[currentMode].includes(targetMode)) {
    return targetMode;
  }

  throw new Error(`Invalid table mode transition from ${currentMode} to ${targetMode}`);
};

/**
 * 1. Reusable Editable Cell
 */
const EditableCell = ({
  initialValue,
  onSave,
  onCancel,
  errorMessage,
  isSaving,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validationMessage = getInlineValidationMessage(value);
  const effectiveErrorMessage = errorMessage || validationMessage;
  const isSaveDisabled = Boolean(validationMessage) || isSaving;

  const handleSave = () => {
    if (!isSaveDisabled) {
      onSave(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <span className="d-flex align-items-start">
      <span className='mr-2'>
        <input
          autoFocus
          type="text"
          className="form-control form-control-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder='Type tag name'
        />
        {effectiveErrorMessage && (
          <div className="text-danger small mt-1">{effectiveErrorMessage}</div>
        )}
      </span>
      <span className='mr-2'>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </span>
      <span className='mr-2'>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaveDisabled}>
          Save
        </Button>
      </span>
      {isSaving && (
        <Spinner
          animation="border"
          role="status"
          variant="primary"
          size="sm"
          screenReaderText="Saving..."
        />
      )}
    </span>
  );
};

EditableCell.propTypes = {
  initialValue: Proptypes.string,
  onSave: Proptypes.func.isRequired,
  onCancel: Proptypes.func.isRequired,
  errorMessage: Proptypes.string,
  isSaving: Proptypes.bool,
};

EditableCell.defaultProps = {
  initialValue: '',
  errorMessage: '',
  isSaving: false,
};

/**
 * Expand toggle for rows with children (Updated for v8 API)
 */
const OptionalExpandLink = ({ row }) => {
  return (
    row.depth === 0 && row.original.childCount > 0 ? (
      <a
        className="d-flex justify-content-end"
        style={{ cursor: 'pointer' }}
        onClick={row.getToggleExpandedHandler()}
      >
        Expand row
      </a>
    ) : null
  )
};
OptionalExpandLink.propTypes = { row: Proptypes.object.isRequired };

function getColumns({
  intl,
  handleCreateTopTag,
  setIsCreatingTopTag,
  setCreatingParentId,
  handleUpdateTag,
  setEditingRowId,
  setToast,
  onStartDraft,
  activeActionMenuRowId,
  setActiveActionMenuRowId,
  hasOpenDraft,
  draftError,
  setDraftError,
  isSavingDraft,
  maxDepth,
  creatingParentId,
}) {
  const canAddSubtag = (row) => row.original.depth < maxDepth;

  return [
    {
      header: intl.formatMessage(messages.tagListColumnValueHeader),
      cell: ({ row }) => {
        const { isNew, isEditing, value, descendantCount, id } = row.original;

        if (isNew) {
          return (
            <EditableCell
              errorMessage={draftError}
              isSaving={isSavingDraft}
              onSave={(value) => handleCreateTopTag(value, setToast)}
              onCancel={() => {
                setDraftError('');
                setIsCreatingTopTag(false);
              }} />
          );
        }

        if (isEditing) {
          return (
            <EditableCell
              initialValue={value}
              errorMessage={draftError}
              onSave={(newVal) => handleUpdateTag(id, newVal, value)}
              onCancel={() => {
                setDraftError('');
                setEditingRowId(null);
              }} />
          );
        }

        return (
          <>
            <span>{value}</span>
            <span className="text-secondary-500">{` (${descendantCount})`}</span>
          </>
        );
      },
    },
    {
      id: 'expander',
      header: () => <></>,
      cell: OptionalExpandLink,
    },
    {
      id: 'add',
      header: () => (
        <IconButtonWithTooltip
          tooltipPlacement='top'
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
      cell: ({ row }) => {
        if (row.original.isNew || !canAddSubtag(row)) {
          return <div className="d-flex gap-2"></div>;
        }

        const isMenuOpen = activeActionMenuRowId === row.original.id;
        const disableAddSubtag = hasOpenDraft && creatingParentId !== row.original.id;
        const startSubtagDraft = () => {
          onStartDraft();
          setDraftError('');
          setCreatingParentId(row.original.id);
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
                setActiveActionMenuRowId(isMenuOpen ? null : row.original.id);
              }}
              disabled={disableAddSubtag}
            />
            {isMenuOpen && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={startSubtagDraft}
                disabled={disableAddSubtag}
              >
                Add Subtag
              </Button>
            )}
          </div>
        );
      }
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

// function addEditRow(data, editingRowId) {
//   if (!data) return []
//   const augmentedData = data.map(item => ({
//         ...item,
//     isEditing: item.id === editingRowId,
//   }));
//   const tree = new TagTree(augmentedData);

//   return tree.getAllAsDeepCopy();
// }

// function getDisplayData(data, editingRowId, creatingParentId, tableMode) {
//   if (tableMode === TABLE_MODES.DRAFT && creatingParentId === 'top') {
//     data.unshift({
//       id: 'draft-top-row',
//       isNew: true,
//       value: '',
//       descendantCount: 0,
//       childCount: 0,
//     });
//   }
//   return data;
// }

const TagListTable = ({ taxonomyId, maxDepth }) => {
  // The table has a VIEW, DRAFT, and a PREVIEW mode. It starts in VIEW mode.
  // It switches to DRAFT mode when a user edits or creates a tag. It switches to PREVIEW mode after saving changes,
  // and only switches to VIEW when the user refreshes the page, orders a column, or navigates to a different page of the table.
  // During DRAFT and PREVIEW mode the table makes POST requests to the backend and receives success or failure responses.
  // However, the table does not refresh to show the updated data from the backend.
  // This allows us to show the newly created or updated tag in the same place without reordering.
  const intl = useIntl();

  // Standardizing pagination state for TanStack v8
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const [creatingParentId, setCreatingParentId] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const [tableMode, dispatchTableMode] = useReducer(tableModeReducer, TABLE_MODES.VIEW);
  const [tagTree, setTagTree] = useState(/** @type {TagTree | null} */(null));
  const [isCreatingTopTag, setIsCreatingTopTag] = useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState(null);
  const [draftError, setDraftError] = useState('');

  const transitionTableMode = (targetMode) => {
    if (targetMode === tableMode) {
      return;
    }
    dispatchTableMode({ type: TABLE_MODE_ACTIONS.TRANSITION, targetMode });
  };

  const enterDraftMode = () => {
    transitionTableMode(TABLE_MODES.DRAFT);
  };

  const exitDraftWithoutSave = () => {
    transitionTableMode(TABLE_MODES.PREVIEW);
  };

  const applyLocalTagPreview = (value, parentTagValue = null) => {
    setTagTree((currentTagTree) => {
      const nextTree = currentTagTree || new TagTree([]);
      const parentTag = parentTagValue ? nextTree.getTagAsDeepCopy(parentTagValue) : null;

      nextTree.addNode({
        id: Date.now(),
        value,
        parentValue: parentTagValue,
        depth: parentTag ? parentTag.depth + 1 : 0,
        childCount: 0,
        descendantCount: 0,
        subTagsUrl: null,
        externalId: null,
      }, parentTagValue);

      return nextTree;
    });
  };

  const { isLoading, data: tagList } = useTagListData(taxonomyId, {
    ...pagination,
    enabled: tableMode === TABLE_MODES.VIEW,
  });
  const createTagMutation = useCreateTag(taxonomyId);

  useEffect(() => {
    // get row data if table is in VIEW mode, otherwise keep current data to avoid disrupting user while they are editing or creating a tag
    if (tableMode === TABLE_MODES.VIEW && tagList?.results) {
      const tree = new TagTree(tagList?.results);
      if (tree) {
        setTagTree(tree);
      }
    }
  }, [tagList?.results, editingRowId, pagination, tableMode]);

  const handleCreateTopTag = async (value, setToast) => {
    const trimmed = value.trim();
    const validationError = getInlineValidationMessage(trimmed);
    if (validationError) {
      setDraftError(validationError);
      return;
    }

    try {
      setDraftError('');
      await createTagMutation.mutateAsync({ value: trimmed });
      applyLocalTagPreview(trimmed);
      transitionTableMode(TABLE_MODES.PREVIEW);
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagCreationSuccessMessage, { name: trimmed }),
        variant: 'success',
      });
      setIsCreatingTopTag(false);
    } catch (error) {
      transitionTableMode(TABLE_MODES.PREVIEW);
      setDraftError(/** @type {any} */(error)?.message || intl.formatMessage(messages.tagCreationErrorMessage));
      setToast({ show: true, message: 'Toast: Tag not saved', variant: 'danger' });
    }
  };

  const handleCreateSubTag = async (value, parentTagValue) => {
    const trimmed = value.trim();
    const validationError = getInlineValidationMessage(trimmed);
    if (validationError) {
      setDraftError(validationError);
      return;
    }

    try {
      setDraftError('');
      await createTagMutation.mutateAsync({ value: trimmed, parentTagValue });
      applyLocalTagPreview(trimmed, parentTagValue);
      transitionTableMode(TABLE_MODES.PREVIEW);
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagCreationSuccessMessage, { name: trimmed }),
        variant: 'success',
      });
      setCreatingParentId(null);
    } catch (error) {
      transitionTableMode(TABLE_MODES.PREVIEW);
      setDraftError(/** @type {any} */(error)?.message || intl.formatMessage(messages.tagCreationErrorMessage));
      setToast({ show: true, message: 'Toast: Tag not saved', variant: 'danger' });
    }
  };

  const handleUpdateTag = async (id, value, originalValue) => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== originalValue) {
      console.log('Update backend here', id, trimmed);
    }
    setEditingRowId(null);
  };

  const hasOpenDraft = isCreatingTopTag || creatingParentId !== null || editingRowId !== null;

  const columns = useMemo(() => getColumns({
    intl,
    handleCreateTopTag,
    setIsCreatingTopTag,
    setCreatingParentId,
    handleUpdateTag,
    setEditingRowId,
    setToast,
    onStartDraft: enterDraftMode,
    activeActionMenuRowId,
    setActiveActionMenuRowId,
    hasOpenDraft,
    draftError,
    setDraftError,
    isSavingDraft: createTagMutation.isPending,
    maxDepth,
    creatingParentId,
  }),
    [
      intl,
      isCreatingTopTag,
      editingRowId,
      tableMode,
      activeActionMenuRowId,
      hasOpenDraft,
      creatingParentId,
      draftError,
      createTagMutation.isPending,
      maxDepth,
    ]
  );

  const handlePaginationChange = (updater) => {
    if (tableMode === TABLE_MODES.PREVIEW) {
      transitionTableMode(TABLE_MODES.VIEW);
    }
    setPagination(updater);
  };

  // Initialize TanStack Table
  const table = useReactTable({
    data: tagTree?.getAllAsDeepCopy() || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Manual pagination config
    manualPagination: true,
    pageCount: tagList?.numPages ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: handlePaginationChange,
    getSubRows: (row) => row.subRows || undefined,
  });

  const pageCount = tagList?.numPages ?? -1;
  const treeData = tagTree?.getAllAsDeepCopy() || [];

  return (
    <EditableTreeTableDisplay
      {...{
        maxDepth,
        treeData,
        columns,
        pageCount,
        pagination,
        handlePaginationChange,
        isLoading,
        isCreatingTopRow: isCreatingTopTag,
        draftError,
        createRowMutation: createTagMutation,
        handleCreateTopRow: handleCreateTopTag,
        toast,
        setToast,
        setIsCreatingTopRow: setIsCreatingTopTag,
        exitDraftWithoutSave,
        handleCreateChildRow: handleCreateSubTag,
        creatingParentId,
        setCreatingParentId,
        editingRowId,
        setEditingRowId,
        setDraftError,
        enterDraftMode,
      }}
    />
  );
};

TagListTable.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
};

export default TagListTable;
