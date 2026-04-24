import React, { useContext, useMemo } from 'react';
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
// @ts-ignore
import './TableView.scss';
import messages from './messages';
import SaveErrorAlert from './SaveErrorAlert';
import { TreeTableContext } from './TreeTableContext';
import { TreeTable } from './types';

interface TableViewProps {
  enablePagination?: boolean;
  hasAdditionalError?: boolean;
}

const TableView = ({
  enablePagination = false,
  hasAdditionalError = false,
}: TableViewProps) => {
  const intl = useIntl();

  const contextValue = useContext(TreeTableContext);

  const {
    treeData,
    columns,
    pageCount,
    pagination,
    handlePaginationChange,
    draftError,
    createRowMutation,
    updateRowMutation,
    toast,
    setToast,
  } = contextValue;

  const table: TreeTable = useReactTable({
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

  const nestedContextValue = useMemo(() => ({
    ...contextValue,
    table,
  }), [contextValue, table]);

  const currentPageIndex = table.getState().pagination.pageIndex + 1;

  const { isError } = createRowMutation;
  const { isError: isUpdateError } = updateRowMutation;

  return (
    // This is a nested context provider. It is a valid pattern in React even if it looks odd,
    // and the purpose here is to add the react-table instance to the overall context.
    // Note that there is an outer context provider higher up in `TagListTable` as well.
    <TreeTableContext.Provider value={nestedContextValue}>
      <SaveErrorAlert
        draftError={draftError}
        isError={isError}
        isUpdateError={isUpdateError}
        isAdditionalError={hasAdditionalError}
      />
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
            <TableBody />
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
    </TreeTableContext.Provider>
  );
};

export { TableView };
