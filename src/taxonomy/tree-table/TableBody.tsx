import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { flexRender } from '@tanstack/react-table';

import { LoadingSpinner } from '@src/generic/Loading';
import NestedRows from './NestedRows';

import messages from './messages';
import { TreeTableContext } from './TreeTableContext';

import CreateRow from './CreateRow';
import EditRow from './EditRow';

const TableBody = () => {
  const intl = useIntl();
  const {
    columns,
    isCreatingTopRow,
    handleCreateRow,
    exitDraftWithoutSave,
    creatingParentId,
    setCreatingParentId,
    setDraftError,
    table,
    isLoading,
    handleUpdateRow,
    editingRowId,
    setEditingRowId,
  } = useContext(TreeTableContext);

  if (!table) {
    return null;
  }

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="text-center">
            <LoadingSpinner />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {table.getRowModel().rows.length === 0 && (
        <tr>
          <td colSpan={columns.length} className="text-center">
            {intl.formatMessage(messages.noResultsFoundMessage)}
          </td>
        </tr>
      )}

      {isCreatingTopRow && (
        <CreateRow />
      )}

      {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
        <React.Fragment key={row.id}>
          {editingRowId === `${row.original.id}:${String(row.original.value)}` ?
            (
              <EditRow
                initialValue={String(row.original.value)}
                handleUpdateRow={(value) => handleUpdateRow(value, String(row.original.value))}
                cancelEditRow={() => {
                  setEditingRowId(null);
                  exitDraftWithoutSave();
                }}
                row={row}
              />
            ) :
            (
              <tr>
                {row.getVisibleCells()
                  .map((cell) => (
                    <td key={cell.id} className="p-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
              </tr>
            )}
          <NestedRows
            parentRow={row}
            childRowsData={row.subRows}
            parentRowValue={String(row.original.value)}
            isCreating={creatingParentId === row.original.id}
            onSaveNewChildRow={handleCreateRow}
            onCancelCreation={() => {
              setDraftError('');
              setCreatingParentId(null);
              exitDraftWithoutSave();
            }}
          />
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TableBody;
