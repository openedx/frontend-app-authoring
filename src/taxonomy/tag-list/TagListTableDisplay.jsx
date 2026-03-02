// @ts-check
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Toast,
  Card,
  ActionRow,
  Pagination,
} from '@openedx/paragon';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { LoadingSpinner } from '../../generic/Loading';
import messages from './messages';
import EditableCell from './EditableCell';
import SubTagsExpanded from './SubTagsExpanded';

const TagListTableDisplay = ({
  maxDepth,
  tagTree,
  columns,
  tagList,
  pagination,
  handlePaginationChange,
  isLoading,
  isCreatingTopTag,
  draftError,
  createTagMutation,
  handleCreateTopTag,
  toast,
  setToast,
  setIsCreatingTopTag,
  exitDraftWithoutSave,
  handleCreateSubTag,
  creatingParentId,
  setCreatingParentId,
  editingRowId,
  setEditingRowId,
  setDraftError,
  enterDraftMode,
}) => {
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
    getSubRows: (row) => row?.subRows || undefined,
  });

    const intl = useIntl();

  return (
    <Card>
      <Card.Header
        actions={
          <ActionRow>
            <Button onClick={() => table.toggleAllRowsExpanded()}>
              Expand All
            </Button>
          </ActionRow>
        } />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card.Section className="p-0">
          <table className="table w-100" style={{ borderCollapse: 'collapse' }}>
            <thead className="bg-light-400">
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

              {isCreatingTopTag && (
                <tr id="creating-top-tag-row" data-testid="creating-top-tag-row">
                  <td style={{ padding: '8px 8px 8px 0' }}>
                    <EditableCell
                      errorMessage={draftError}
                      isSaving={createTagMutation.isPending}
                      onSave={(value) => handleCreateTopTag(value, setToast)}
                      onCancel={() => {
                        setDraftError('');
                        setIsCreatingTopTag(false);
                        exitDraftWithoutSave();
                      }} />
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
                <React.Fragment key={row.id}>
                  {/* Main Row */}
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    {row.getVisibleCells()
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
                          onCancelCreation={() => {
                            setDraftError('');
                            setCreatingParentId(null);
                            exitDraftWithoutSave();
                          }}
                          createTagMutation={createTagMutation}
                          creatingParentId={creatingParentId}
                          editingRowId={editingRowId}
                          setCreatingParentId={setCreatingParentId}
                          setEditingRowId={setEditingRowId}
                          maxDepth={maxDepth}
                          draftError={draftError}
                          isSavingDraft={createTagMutation.isPending}
                          onStartDraft={enterDraftMode}
                          setIsCreatingTopTag={setIsCreatingTopTag}
                          setDraftError={setDraftError}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card.Section>
      )}

      {/* Basic Pagination Controls */}
      {((tagList?.numPages || 0)) > 1 && (
        <div role="navigation" aria-label="table pagination" className="d-flex flex-column align-items-center mt-3">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {(tagList?.numPages || 0)}
          </span>
          <Pagination
            className="d-flex justify-content-center"
            paginationLabel="table pagination"
            pageCount={tagList?.numPages || 0}
            currentPage={table.getState().pagination.pageIndex + 1}
            onPageSelect={(page) => {
              table.setPageIndex(page - 1);
            }}
          />
        </div>
      )}
      <Toast
        show={toast.show}
        onClose={() => { setToast((prevToast) => ({ ...prevToast, show: false }))} }
        delay={15000}
        className={toast.variant === 'danger' ? 'bg-danger-100 border-danger' : 'bg-success-100 border-success'}
      >
        {toast.message}
      </Toast>
    </Card>
  );
};

export default TagListTableDisplay;
