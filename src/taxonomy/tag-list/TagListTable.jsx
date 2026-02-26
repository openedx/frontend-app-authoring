// @ts-check
import React, { useState, useMemo, useEffect } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Toast } from '@openedx/paragon';
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

// State machine for table modes

const TABLE_MODES = {
  VIEW: 'view',
  DRAFT: 'draft',
  WRITE: 'write',
}

const TRANSITION_TABLE = {
  [TABLE_MODES.VIEW]: [TABLE_MODES.DRAFT],
  [TABLE_MODES.DRAFT]: [TABLE_MODES.WRITE],
  [TABLE_MODES.WRITE]: [TABLE_MODES.DRAFT, TABLE_MODES.VIEW],
}

const switchMode = (currentMode, targetMode) => {
  if (TRANSITION_TABLE[currentMode].includes(targetMode)) {
    return targetMode;
  }
  throw new Error(`Invalid table mode transition from ${currentMode} to ${targetMode}`);
};

/**
 * 1. Reusable Editable Cell
 */
const EditableCell = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger onBlur to save
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
      </span>
      <span className='mr-2'>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </span>
      <span className='mr-2'>
        <Button variant="primary" size="sm" onClick={() => onSave(value)}>
          Save
        </Button>
      </span>
    </span>
  );
};

EditableCell.propTypes = {
  initialValue: Proptypes.string,
  onSave: Proptypes.func.isRequired,
  onCancel: Proptypes.func.isRequired,
};

EditableCell.defaultProps = {
  initialValue: '',
};

/**
 * SubTagsExpanded Component
 */
const SubTagsExpanded = ({
  parentTagValue,
  isCreating,
  onSaveNewSubTag,
  onCancelCreation,
  subTagsData,
  visibleColumnCount,
  createTagMutation,
  creatingParentId,
  editingRowId,
  setCreatingParentId,
  setEditingRowId,
  maxDepth,
}) => {
  const columnCount = subTagsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;
  const showAddSubTagButton = maxDepth > 0;

  return (
    <>
      {isCreating && (
        <tr>
          <td colSpan={columnCount} style={{ padding: '8px 8px 8px 0' }}>
            <EditableCell
              onSave={(val) => onSaveNewSubTag(val, parentTagValue)}
              onCancel={onCancelCreation}
            />
          </td>
        </tr>
      )}
      {subTagsData?.map(row => {
        const tagData = row.original || row; // Handle both raw and table row data
        return (
          <React.Fragment key={tagData.id}>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {row.getVisibleCells()
                .filter(cell => showAddSubTagButton || cell.column.id !== 'add')
                .map(cell => (
                  <td key={cell.id} style={{ padding: '8px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
              ))}
            </tr>

            <tr style={{ backgroundColor: '#f9f9f9' }}>
              {/* colSpan stretches the sub-row across the whole table */}
              <td colSpan={row.getVisibleCells().length} style={{ padding: '8px 8px 8px 24px' }}>
                <SubTagsExpanded
                  subTagsData={row.subRows}
                  visibleColumnCount={row.getVisibleCells().length}
                  parentTagValue={row.original.value}
                  parentTagId={row.original.id}
                  isCreating={creatingParentId === row.original.id}
                  onSaveNewSubTag={onSaveNewSubTag}
                  onCancelCreation={() => setCreatingParentId(null)}
                  createTagMutation={createTagMutation}
                  creatingParentId={creatingParentId}
                  editingRowId={editingRowId}
                  setCreatingParentId={setCreatingParentId}
                  setEditingRowId={setEditingRowId}
                  maxDepth={maxDepth - 1}
                />
              </td>
            </tr>
          </React.Fragment>
        );
      })}
    </>
  );
};

SubTagsExpanded.propTypes = {
  subTagsData: Proptypes.array.isRequired,
  visibleColumnCount: Proptypes.number,
  parentTagValue: Proptypes.string.isRequired,
  parentTagId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]).isRequired,
  isCreating: Proptypes.bool,
  onSaveNewSubTag: Proptypes.func,
  onCancelCreation: Proptypes.func,
  createTagMutation: Proptypes.object,
  creatingParentId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  editingRowId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  setCreatingParentId: Proptypes.func,
  setEditingRowId: Proptypes.func,
  maxDepth: Proptypes.number,
};

/**
 * Expand toggle for rows with children (Updated for v8 API)
 */
const OptionalExpandLink = ({ row }) => {
  return (
    row.original.childCount > 0 ? (
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

function getColumns(intl, handleCreateTopTag, setCreatingParentId, handleUpdateTag, setEditingRowId, setToast) {
  return [
    {
      header: intl.formatMessage(messages.tagListColumnValueHeader),
      cell: ({ row }) => {
        const { isNew, isEditing, value, descendantCount, id } = row.original;

        if (isNew) {
          return (
            <EditableCell
              onSave={(value) => handleCreateTopTag(value, setToast)}
              onCancel={() => setCreatingParentId(null)} />
          );
        }

        if (isEditing) {
          return (
            <EditableCell
              initialValue={value}
              onSave={(newVal) => handleUpdateTag(id, newVal, value)}
              onCancel={() => setEditingRowId(null)} />
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
        <span
          style={{ cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', color: '#0056b3', marginLeft: '0.5rem' }}
          title="Add Tag"
          onClick={() => {
            setCreatingParentId('top');
            setEditingRowId(null);
          } }
        >
          Add Tag
        </span>
      ),
      cell: ({ row }) => {
        if (row.original.isNew) {
          return <div className="d-flex gap-2"></div>;
        }

        return (
          <div className="d-flex gap-2">
            <span
              style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3' }}
              onClick={() => {
                setCreatingParentId(row.original.id);
                setEditingRowId(null);
                row.toggleExpanded(true);
              } }
            >
              Add Subtag
            </span>
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

function addEditRow(data, editingRowId) {
  if (!data) return []
  const augmentedData = data.map(item => ({
        ...item,
    isEditing: item.id === editingRowId,
  }));
  const tree = new TagTree(augmentedData);

  return tree.rows;
}

function getDisplayData(data, editingRowId, creatingParentId, tableMode) {
  if (tableMode === TABLE_MODES.DRAFT && creatingParentId === 'top') {
    data.unshift({
      id: 'draft-top-row',
      isNew: true,
      value: '',
      descendantCount: 0,
      childCount: 0,
    });
  }
  return data;
}

const TagListTable = ({ taxonomyId, maxDepth }) => {
  // The table has a VIEW and a WRITE mode. It starts in VIEW mode.
  // It switches to WRITE mode when a user edits or creates a tag. It remains in WRITE mode even after saving changes,
  // and only switches to VIEW when the user refreshes the page, orders a column, or navigates to a different page of the table.
  // During WRITE mode, the table makes POST requests to the backend and receives success or failure responses.
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

  const [tableMode, setTableMode] = useState(TABLE_MODES.VIEW);
  const [tagTree, setTagTree] = useState(null);

  const { isLoading, data: tagList } = useTagListData(taxonomyId, pagination);
  const createTagMutation = useCreateTag(taxonomyId);

  useMemo(() => {
    // get row data if table is in VIEW mode, otherwise keep current data to avoid disrupting user while they are editing or creating a tag
    if (tableMode === TABLE_MODES.VIEW && tagList?.results) {
      console.log('tagList results: ', tagList?.results);
      const tree = new TagTree(tagList?.results);
      console.log('tree rows: ', tree.rows);
      setTagTree(tree);
    }
  }, [tagList?.results, editingRowId, pagination, tableMode]);



  const remainingDepth = maxDepth - 1
  const showAddSubTagButton = remainingDepth > 0;

  const handleCreateTopTag = async (value, setToast) => {
    console.log('Creating top-level tag with value:', value);
    if (value.trim()) {
      await createTagMutation.mutateAsync({ value });
      setToast({ show: true, message: intl.formatMessage(messages.tagCreationSuccessMessage, { name: value }), variant: 'success' });
    }
    setCreatingParentId(null);
  };

  const handleCreateSubTag = async (value, parentTagValue) => {
    if (value.trim()) {
      await createTagMutation.mutateAsync({ value, parentTagValue });
      setToast({ show: true, message: intl.formatMessage(messages.tagCreationSuccessMessage, { name: value }), variant: 'success' });
    }
    setCreatingParentId(null);
  };

  const handleUpdateTag = async (id, value, originalValue) => {
    if (value.trim() && value !== originalValue) {
      console.log('Update backend here', id, value);
    }
    setEditingRowId(null);
  };

  const columns = useMemo(() => getColumns(intl, handleCreateTopTag, setCreatingParentId, handleUpdateTag, setEditingRowId, setToast), [intl, creatingParentId, editingRowId]);

  console.log('rowData for table: ', displayData);

  // Initialize TanStack Table
  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Manual pagination config
    manualPagination: true,
    pageCount: tagList?.numPages ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getSubRows: (row) => row.subRows || null,
  });

  return (
    <div className="tag-list-table">
      <div className="mb-3">
        <Button onClick={() => table.toggleAllRowsExpanded()}>
          Expand All
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <table className="table w-100" style={{ borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ borderBottom: '2px solid #ddd' }}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ padding: '8px', textAlign: 'left' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '1rem' }}>
                  {intl.formatMessage(messages.noResultsFoundMessage)}
                </td>
              </tr>
            )}

            {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
              <React.Fragment key={row.id}>
                {/* Main Row */}
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {row.getVisibleCells()
                    .filter(cell => showAddSubTagButton || cell.column.id !== 'add')
                    .map(cell => (
                    <td key={cell.id} style={{ padding: '8px' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>

                {/* Subcomponent Rendering */}
                {row.getIsExpanded() && (
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    {/* colSpan stretches the sub-row across the whole table */}
                    <td colSpan={row.getVisibleCells().length} style={{ padding: '8px 8px 8px 24px' }}>
                      <SubTagsExpanded
                        subTagsData={row.subRows}
                        visibleColumnCount={row.getVisibleCells().length}
                        parentTagValue={row.original.value}
                        parentTagId={row.original.id}
                        isCreating={creatingParentId === row.original.id}
                        onSaveNewSubTag={handleCreateSubTag}
                        onCancelCreation={() => setCreatingParentId(null)}
                        createTagMutation={createTagMutation}
                        creatingParentId={creatingParentId}
                        editingRowId={editingRowId}
                        setCreatingParentId={setCreatingParentId}
                        setEditingRowId={setEditingRowId}
                        maxDepth={remainingDepth - 1}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* Basic Pagination Controls */}
      {(tagList?.numPages || 0) > 1 && (
        <div role="navigation" aria-label="table pagination" className="d-flex justify-content-between align-items-center mt-3">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      )}
      <Toast
        show={toast.show}
        onClose={() => { setToast({ show: false })} }
        delay={15000}
        className="bg-success-100 border-success"
      >
        {toast.message}
      </Toast>
    </div>
  );
};

TagListTable.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
};

export default TagListTable;
