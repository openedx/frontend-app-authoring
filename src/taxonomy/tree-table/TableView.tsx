import React from 'react';
import {
  Button,
  Toast,
  Card,
  ActionRow,
  Pagination,
  Alert,
} from '@openedx/paragon';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type OnChangeFn,
  type PaginationState,
  type TableMeta,
} from '@tanstack/react-table';

import { LoadingSpinner } from '../../generic/Loading';
import TableBody from './TableBody';
import type {
  CreateRowMutationState,
  RowId,
  ToastState,
  TreeColumnDef,
  TreeRowData,
} from './types';
import messages from './messages';
import { Info } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

interface TableViewProps {
  treeData: TreeRowData[];
  columns: TreeColumnDef[];
  pageCount: number;
  pagination: PaginationState;
  handlePaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  isCreatingTopRow: boolean;
  draftError: string;
  createRowMutation: CreateRowMutationState;
  toast: ToastState;
  setToast: React.Dispatch<React.SetStateAction<ToastState>>;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  handleCreateRow: (value: string, parentRowValue?: string) => void;
  creatingParentId: RowId | null;
  setCreatingParentId: (id: RowId | null) => void;
  setDraftError: (error: string) => void;
  meta: TableMeta<TreeRowData>;
}

const TableView = ({
  treeData,
  meta,
  columns,
  pageCount,
  pagination,
  handlePaginationChange,
  isLoading,
  isCreatingTopRow,
  draftError,
  createRowMutation,
  handleCreateRow,
  toast,
  setToast,
  setIsCreatingTopRow,
  exitDraftWithoutSave,
  creatingParentId,
  setCreatingParentId,
  setDraftError,
}: TableViewProps) => {
  const table = useReactTable({
    data: treeData,
    meta,
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

  const { error, isError } = createRowMutation;
  const intl = useIntl();

  return (
    <>
      {isError && (
        <Alert variant="danger" icon={Info} dismissible>
          <Alert.Heading>
            {intl.formatMessage(messages.errorSavingTitle)}
          </Alert.Heading>
          {intl.formatMessage(messages.errorSavingMessage)}
        </Alert>
      )}
      <Card>
        <Card.Header
          actions={(
            <ActionRow>
              <Button onClick={() => table.toggleAllRowsExpanded()}>
                Expand All
              </Button>
            </ActionRow>
          )}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Card.Section className="p-0">
            <table className="table w-100 tag-list-table" style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' }}>
              <thead className="bg-light-400">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} style={{
                        padding: '8px',
                        textAlign: 'left',
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize ?? header.getSize(),
                        maxWidth: header.column.columnDef.maxSize ?? header.getSize(),
                      }}>
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
                table={table}
              />
            </table>
          </Card.Section>
        )}

        {pageCount > 1 && (
          <div role="navigation" aria-label="table pagination" className="d-flex flex-column align-items-center mt-3">
            <span>
              Page {currentPageIndex} of {pageCount}
            </span>
            <Pagination
              className="d-flex justify-content-center"
              paginationLabel="table pagination"
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
          className={toast.variant === 'danger' ? 'bg-danger-100 border-danger' : 'bg-success-100 border-success'}
        >
          {toast.message}
        </Toast>
      </Card>
    </>
  );
};

export { TableView };
