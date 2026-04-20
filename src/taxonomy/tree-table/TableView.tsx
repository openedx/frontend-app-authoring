import React, { useContext } from 'react';
import {
  Button,
  Toast,
  Card,
  ActionRow,
  Pagination,
  Icon,
} from '@openedx/paragon';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { ArrowDropUpDown } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import TableBody from './TableBody';
import './TableView.scss';
import messages from './messages';
import SaveErrorAlert from './SaveErrorAlert';
import { TreeTableContext } from './TreeTableContext';

interface TableViewProps {
  enablePagination?: boolean;
}

const TableView = ({
  enablePagination = false,
}: TableViewProps) => {
  const intl = useIntl();
  const {
    treeData,
    columns,
    pageCount,
    pagination,
    handlePaginationChange,
    isLoading,
    isCreatingTopRow,
    draftError,
    createRowMutation,
    updateRowMutation,
    handleCreateRow,
    toast,
    setToast,
    setIsCreatingTopRow,
    exitDraftWithoutSave,
    creatingParentId,
    setCreatingParentId,
    setDraftError,
    validate,
    handleUpdateRow,
    editingRowId,
    setEditingRowId,
  } = useContext(TreeTableContext);

  const table = useReactTable({
    data: treeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: handlePaginationChange,
    getSubRows: (row) => row?.subRows || undefined,
  });

  const currentPageIndex = table.getState().pagination.pageIndex + 1;

  const { isError } = createRowMutation;
  const { isError: isUpdateError } = updateRowMutation;

  return (
    <>
      <SaveErrorAlert draftError={draftError} isError={isError} isUpdateError={isUpdateError} />
      <Card className="tag-list-card">
        <Card.Section className="p-0">
          <div className="d-flex justify-content-end align-items-center p-4">
            {/* TODO: Implement search functionality */}
            <ActionRow>
              <Button
                onClick={() => table.toggleAllRowsExpanded()}
                variant="link"
                size="inline"
                className="text-primary-500"
                aria-pressed={table.getIsAllRowsExpanded()}
              >
                {table.getIsAllRowsExpanded()
                  ? intl.formatMessage(messages.collapseAll)
                  : intl.formatMessage(messages.expandAll)}
                <Icon src={ArrowDropUpDown} />
              </Button>
            </ActionRow>
          </div>
          <table className="table w-100 tag-list-table tree-table-layout-fixed">
            <thead className="bg-light-400">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`p-2 text-left ${index === 0 ? 'pl-2.5' : ''}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <TableBody
              columns={columns}
              isCreatingTopRow={isCreatingTopRow}
              draftError={draftError}
              handleCreateRow={handleCreateRow}
              setIsCreatingTopRow={setIsCreatingTopRow}
              exitDraftWithoutSave={exitDraftWithoutSave}
              creatingParentId={creatingParentId}
              setCreatingParentId={setCreatingParentId}
              setDraftError={setDraftError}
              createRowMutation={createRowMutation}
              updateRowMutation={updateRowMutation}
              table={table}
              isLoading={isLoading}
              validate={validate}
              handleUpdateRow={handleUpdateRow}
              editingRowId={editingRowId}
              setEditingRowId={setEditingRowId}
            />
          </table>
        </Card.Section>

        {enablePagination && pageCount > 1 && (
          <div
            role="navigation"
            aria-label={intl.formatMessage(messages.tablePaginationLabel)}
            className="d-flex flex-column align-items-center mt-3"
          >
            <span>
              {intl.formatMessage(messages.tablePaginationPageStatus, {
                currentPage: currentPageIndex,
                pageCount,
              })}
            </span>
            <Pagination
              className="d-flex justify-content-center"
              paginationLabel={intl.formatMessage(messages.tablePaginationLabel)}
              pageCount={pageCount}
              currentPage={currentPageIndex}
              onPageSelect={(page) => {
                table.setPageIndex(page - 1);
              }}
            />
          </div>
        )}
        <Toast
          show={toast.show}
          onClose={() => {
            setToast((prevToast) => ({ ...prevToast, show: false }));
          }}
          delay={15000}
        >
          {toast.message}
        </Toast>
      </Card>
    </>
  );
};

export { TableView };
