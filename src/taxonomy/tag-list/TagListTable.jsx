// @ts-check
import React, { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { isEqual } from 'lodash';
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
    <input
      autoFocus
      type="text"
      className="form-control form-control-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value)}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    />
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
}) => {
  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '30px', margin: '10px 0' }}>
      {isCreating && (
        <tr style={{ marginBottom: '8px' }}>
          <EditableCell
            onSave={(val) => onSaveNewSubTag(val, parentTagValue)}
            onCancel={onCancelCreation}
          />
        </tr>
      )}
      {subTagsData?.map(row => {
        const tagData = row.original || row; // Handle both raw and table row data
        return (
          <>
            <tr key={tagData.id}>
              <td key={tagData.id} style={{ paddingLeft: `${(tagData.depth - 1) * 30}px`, marginBottom: '4px' }}>
                {tagData.value} <span className="text-secondary-500">{tagData.descendantCount > 0 ? `(${tagData.descendantCount})` : null}</span>
              </td>
            </tr>
            <tr>
              {/* colSpan stretches the sub-row across the whole table */}
              <td colSpan={row.getVisibleCells().length} style={{ padding: '8px 8px 8px 24px' }}>
                <SubTagsExpanded
                  subTagsData={row.subRows}
                  parentTagValue={row.original.value}
                  parentTagId={row.original.id}
                  // isCreating={creatingParentId === row.original.id}
                  // onSaveNewSubTag={handleCreateSubTag}
                  // onCancelCreation={() => setCreatingParentId(null)}
                />
              </td>
            </tr>
          </>
        );
      })}
    </ul>
  );
};

SubTagsExpanded.propTypes = {
  subTagsData: Proptypes.array.isRequired,
  parentTagValue: Proptypes.string.isRequired,
  parentTagId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]).isRequired,
  isCreating: Proptypes.bool,
  onSaveNewSubTag: Proptypes.func,
  onCancelCreation: Proptypes.func,
};

/**
 * Expand toggle for rows with children (Updated for v8 API)
 */
const OptionalExpandLink = ({ row }) => {
  console.log('can expand: ', row.getCanExpand())
  return (
    row.original.childCount > 0 ? (
      <div
        className="d-flex justify-content-end"
        style={{ cursor: 'pointer' }}
        onClick={row.getToggleExpandedHandler()}
      >
        {row.getIsExpanded() ? 'v' : '>'}
      </div>
    ) : null
  )
};
OptionalExpandLink.propTypes = { row: Proptypes.object.isRequired };

function getColumns(intl, handleCreateTopTag, setCreatingParentId, handleUpdateTag, setEditingRowId) {
  return [
    {
      header: intl.formatMessage(messages.tagListColumnValueHeader),
      cell: ({ row }) => {
        const { isNew, isEditing, value, descendantCount, id } = row.original;

        if (isNew) {
          return (
            <EditableCell
              onSave={handleCreateTopTag}
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
          style={{ cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
          title="Add Tag"
          onClick={() => {
            setCreatingParentId('top');
            setEditingRowId(null);
          } }
        >
          +
        </span>
      ),
      cell: ({ row }) => {
        if (row.original.isNew) {
          return <div className="d-flex gap-2"></div>;
        }

        return (
          <div className="d-flex gap-2">
            <span
              style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3', marginRight: '1rem' }}
              onClick={() => {
                setEditingRowId(row.original.id);
                setCreatingParentId(null);
              } }
            >
              Edit
            </span>
            <span
              style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3' }}
              onClick={() => {
                setCreatingParentId(row.original.id);
                setEditingRowId(null);
                // v8 API uses toggleExpanded(true) to force expand
                row.toggleExpanded(true);
              } }
            >
              + Subtag
            </span>
          </div>
        );
      }
    },
  ];
}

// AI-generated
function buildTree(data) {
  const tree = [];
  const lookup = {};

  // Step 1: Create a lookup map of all items using 'value' as the key.
  // We use the spread operator (...) to create a shallow copy so we
  // don't mutate the original data array.
  for (const item of data) {
    lookup[item.value] = { ...item };
  }

  // Step 2: Iterate through the data again to link children to their parents.
  for (const item of data) {
    // Get the reference to the newly copied object in our lookup map
    const currentNode = lookup[item.value];
    const parentValue = currentNode.parentValue;

    if (parentValue !== null && lookup[parentValue]) {
      // If the node has a parent, initialize the subRows array (if needed) and push it
      if (!lookup[parentValue].subRows) {
        lookup[parentValue].subRows = [];
      }
      lookup[parentValue].subRows.push(currentNode);
    } else {
      // If there is no parentValue (or it equals null), it is a root node
      tree.push(currentNode);
    }
  }

  return tree;
}

function transformToTableData(data, editingRowId) {
  if (!data) return []
  const augmentedData = data.map(item => ({
        ...item,
    isEditing: item.id === editingRowId,
  }));
  const nestedData = buildTree(augmentedData);

  return nestedData;
}

function getRowData(tagList, editingRowId, creatingParentId) {
  const data = transformToTableData(tagList?.results, editingRowId)

  if (creatingParentId === 'top') {
    data.unshift({
      id: 'draft-top-row',
      isNew: true,
      value: '',
      descendantCount: 0,
      childCount: 0,
    });
  }
  console.log('rowData: ', data);
  return data;
}

const TagListTable = ({ taxonomyId }) => {
  const intl = useIntl();

  // Standardizing pagination state for TanStack v8
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const [creatingParentId, setCreatingParentId] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  const { isLoading, data: tagList } = useTagListData(taxonomyId, pagination);
  const createTagMutation = useCreateTag(taxonomyId);

  const rowData = useMemo(() => {
    return getRowData(tagList, editingRowId, creatingParentId);
  }, [tagList?.results, creatingParentId, editingRowId]);


  const handleCreateTopTag = async (value) => {
    if (value.trim()) {
      await createTagMutation.mutateAsync({ value });
    }
    setCreatingParentId(null);
  };

  const handleCreateSubTag = async (value, parentTagValue) => {
    if (value.trim()) {
      await createTagMutation.mutateAsync({ value, parentTagValue });
    }
    setCreatingParentId(null);
  };

  const handleUpdateTag = async (id, value, originalValue) => {
    if (value.trim() && value !== originalValue) {
      console.log('Update backend here', id, value);
    }
    setEditingRowId(null);
  };

  const columns = useMemo(() => getColumns(intl, handleCreateTopTag, setCreatingParentId, handleUpdateTag, setEditingRowId), [intl, creatingParentId, editingRowId]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: rowData,
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

            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                {/* Main Row */}
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {row.getVisibleCells().map(cell => (
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
                        parentTagValue={row.original.value}
                        parentTagId={row.original.id}
                        isCreating={creatingParentId === row.original.id}
                        onSaveNewSubTag={handleCreateSubTag}
                        onCancelCreation={() => setCreatingParentId(null)}
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
        <div className="d-flex justify-content-between align-items-center mt-3">
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
    </div>
  );
};

TagListTable.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
};

export default TagListTable;
