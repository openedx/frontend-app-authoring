// @ts-check
import React, { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, DataTable } from '@openedx/paragon';
import { isEqual } from 'lodash';
import Proptypes from 'prop-types';

import { LoadingSpinner } from '../../generic/Loading';
import messages from './messages';
import { useTagListData, useSubTags, useCreateTag } from '../data/apiHooks';

/**
 * Modified SubTagsExpanded to accept creation props
 */
const SubTagsExpanded = ({
  taxonomyId,
  parentTagValue,
  parentTagId,
  isCreating,
  onSaveNewSubTag,
  onCancelCreation
}) => {
  const subTagsData = useSubTags(taxonomyId, parentTagValue);

  if (subTagsData.isPending) {
    return <LoadingSpinner />;
  }
  if (subTagsData.isError) {
    return <FormattedMessage {...messages.tagListError} />;
  }

  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '30px', marginTop: '10px' }}>
      {/* 2. Conditionally inject the input field for new sub-rows */}
      {isCreating && (
        <li style={{ marginBottom: '8px' }}>
          <EditableCell
            onSave={(val) => onSaveNewSubTag(val, parentTagId)}
            onCancel={onCancelCreation}
          />
        </li>
      )}
      {subTagsData.data.results.map(tagData => (
        <li key={tagData.id} style={{ paddingLeft: `${(tagData.depth - 1) * 30}px`, marginBottom: '4px' }}>
          {tagData.value} <span className="text-secondary-500">{tagData.descendantCount > 0 ? `(${tagData.descendantCount})` : null}</span>
        </li>
      ))}
    </ul>
  );
};

SubTagsExpanded.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
  parentTagValue: Proptypes.string.isRequired,
  parentTagId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]).isRequired,
  isCreating: Proptypes.bool,
  onSaveNewSubTag: Proptypes.func,
  onCancelCreation: Proptypes.func,
};

/**
 * 1. New Component: Reusable Editable Cell
 * Handles the input field, saving on Enter/Blur, and canceling on Escape.
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
      onClick={(e) => e.stopPropagation()} // Prevent row click events
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

SubTagsExpanded.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
  parentTagValue: Proptypes.string.isRequired,
};

/**
 * An "Expand" toggle to show/hide subtags, but one which is hidden if the given tag row has no subtags.
 */
const OptionalExpandLink = ({ row }) => (
  row.original.childCount > 0 ? <div className="d-flex justify-content-end"><DataTable.ExpandRow row={row} /></div> : null
);
OptionalExpandLink.propTypes = DataTable.ExpandRow.propTypes;

/**
 * Custom DataTable cell to join tag value with child count
 */
const TagValue = ({ row }) => (
  <>
    <span>{row.original.value}</span>
    <span className="text-secondary-500">{` (${row.original.descendantCount})`}</span>
  </>
);
TagValue.propTypes = {
  row: Proptypes.shape({
    original: Proptypes.shape({
      value: Proptypes.string.isRequired,
      childCount: Proptypes.number.isRequired,
      descendantCount: Proptypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

const TagListTable = ({ taxonomyId }) => {
  const intl = useIntl();
  const [options, setOptions] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // 3. New States for editing and creating
  // 'top' means new root row. A tag ID means creating a subtag under that ID. null means inactive.
  const [creatingParentId, setCreatingParentId] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  const { isLoading, data: tagList } = useTagListData(taxonomyId, options);
  const createTagMutation = useCreateTag(taxonomyId);
  // Hypothetical update mutation - replace with your actual API hook
  // const updateTagMutation = useUpdateTag(taxonomyId);

  const fetchData = (args) => {
    if (!isEqual(args, options)) {
      setOptions({ ...args });
    }
  };

  const TableAction = ({ tableInstance }) => (
    // Here is access to the tableInstance
    <Button onClick={() => { tableInstance.toggleAllRowsExpanded() }}>
      Expand All
    </Button>
  );

  // 4. Inject draft row dynamically for top-level creation & append isEditing flags
  const rowData = useMemo(() => {
    const data = [...(tagList?.results || [])].map(item => ({
      ...item,
      isEditing: item.id === editingRowId,
    }));

    if (creatingParentId === 'top') {
      data.unshift({
        id: 'draft-top-row',
        isNew: true,
        value: '',
        descendantCount: 0,
        childCount: 0,
      });
    }
    return data;
  }, [tagList?.results, creatingParentId, editingRowId]);

  // --- Handlers ---
  const handleCreateTopTag = async (value) => {
    if (value.trim()) {
      await createTagMutation.mutateAsync({ value });
    }
    setCreatingParentId(null);
  };

  const handleCreateSubTag = async (value, parentId) => {
    if (value.trim()) {
      // Adjust payload based on how your backend expects parent relationships
      await createTagMutation.mutateAsync({ value, parentId });
    }
    setCreatingParentId(null);
  };

  const handleUpdateTag = async (id, value, originalValue) => {
    if (value.trim() && value !== originalValue) {
      // await updateTagMutation.mutateAsync({ id, value });
      console.log('Update backend here', id, value);
    }
    setEditingRowId(null);
  };

  // 5. Wrap columns in useMemo to safely access state/handlers
  const columns = useMemo(() => [
    {
      Header: intl.formatMessage(messages.tagListColumnValueHeader),
      Cell: ({ row }) => {
        const { isNew, isEditing, value, descendantCount, id } = row.original;

        if (isNew) {
          return (
            <EditableCell
              onSave={handleCreateTopTag}
              onCancel={() => setCreatingParentId(null)}
            />
          );
        }

        if (isEditing) {
          return (
            <EditableCell
              initialValue={value}
              onSave={(newVal) => handleUpdateTag(id, newVal, value)}
              onCancel={() => setEditingRowId(null)}
            />
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
      Header: <></>,
      Cell: OptionalExpandLink,
    },
    {
      id: 'options',
      Header: (
        <span
          style={{ cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
          title="Add Tag"
          onClick={() => {
            setCreatingParentId('top');
            setEditingRowId(null);
          }}
        >
          +
        </span>
      ),
      Cell: ({ row }) => (
        <div className="d-flex gap-2">
          {/* You might want to replace these spans with a Paragon Dropdown/Menu component */}
          <span
            style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3', marginRight: '2rem' }}
            onClick={() => {
              setEditingRowId(row.original.id);
              setCreatingParentId(null);
            }}
          >
            Edit
          </span>
          <span
            style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#0056b3' }}
            onClick={() => {
              setCreatingParentId(row.original.id);
              setEditingRowId(null);
              // Important: Expand the row so the user can see the new input field
              if (!row.isExpanded) row.toggleRowExpanded();
            }}
          >
            + Subtag
          </span>
        </div>
      )
    },
  ], [intl, creatingParentId, editingRowId]); // Re-render columns when these states change

  return (
    <div className="tag-list-table">
      <DataTable
        isLoading={isLoading}
        isPaginated
        manualPagination
        fetchData={fetchData}
        data={rowData}
        itemCount={tagList?.count || 0}
        pageCount={tagList?.numPages || 0}
        initialState={options}
        isExpandable
        tableActions={[
          // @ts-ignore
          <TableAction key="expand-all" />,
        ]}
        renderRowSubComponent={({ row }) => (
          <SubTagsExpanded
            taxonomyId={taxonomyId}
            parentTagValue={row.original.value}
            parentTagId={row.original.id}
            isCreating={creatingParentId === row.original.id}
            onSaveNewSubTag={handleCreateSubTag}
            onCancelCreation={() => setCreatingParentId(null)}
          />
        )}
        columns={columns}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFoundMessage)} />
        {tagList?.numPages !== undefined && tagList?.numPages > 1 && <DataTable.TableFooter />}
      </DataTable>
    </div>
  );
};

TagListTable.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
};

export default TagListTable;
