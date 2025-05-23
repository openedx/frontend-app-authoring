import React, { useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { isEqual } from 'lodash';

import { LoadingSpinner } from '../../generic/Loading';
import messages from './messages';
import { useTagListData, useSubTags } from '../data/apiHooks';
import { TagData, QueryOptions } from '../data/types';

interface SubTagsExpandedProps {
  taxonomyId: number;
  parentTagValue: string;
}

const SubTagsExpanded: React.FC<SubTagsExpandedProps> = ({ taxonomyId, parentTagValue }) => {
  const subTagsData = useSubTags(taxonomyId, parentTagValue);

  if (subTagsData.isLoading) {
    return <LoadingSpinner />;
  }
  if (subTagsData.isError) {
    return <FormattedMessage {...messages.tagListError} />;
  }

  return (
    <ul style={{ listStyleType: 'none' }}>
      {subTagsData.data.results.map(tagData => (
        <li key={tagData.id} style={{ paddingLeft: `${(tagData.depth - 1) * 30}px` }}>
          {tagData.value} <span className="text-secondary-500">{tagData.descendantCount > 0 ? `(${tagData.descendantCount})` : null}</span>
        </li>
      ))}
    </ul>
  );
};

interface OptionalExpandLinkProps {
  row: {
    original: TagData;
    toggleRowExpanded: () => void;
    getToggleRowExpandedProps: () => any;
  };
}

/**
 * An "Expand" toggle to show/hide subtags, but one which is hidden if the given tag row has no subtags.
 */
const OptionalExpandLink: React.FC<OptionalExpandLinkProps> = ({ row }) => (
  row.original.childCount > 0 ? <div className="d-flex justify-content-end"><DataTable.ExpandRow row={row} /></div> : null
);

interface TagValueProps {
  row: {
    original: TagData;
  };
}

/**
 * Custom DataTable cell to join tag value with child count
 */
const TagValue: React.FC<TagValueProps> = ({ row }) => (
  <>
    <span>{row.original.value}</span>
    <span className="text-secondary-500">{` (${row.original.descendantCount})`}</span>
  </>
);

interface TagListTableProps {
  taxonomyId: number;
}

const TagListTable: React.FC<TagListTableProps> = ({ taxonomyId }) => {
  const intl = useIntl();
  const [options, setOptions] = useState<QueryOptions>({
    pageIndex: 0,
    pageSize: 100,
  });
  const { isLoading, data: tagList } = useTagListData(taxonomyId, options);

  const fetchData = (args: QueryOptions) => {
    if (!isEqual(args, options)) {
      setOptions({ ...args });
    }
  };

  return (
    <div className="tag-list-table">
      <DataTable
        isLoading={isLoading}
        isPaginated
        manualPagination
        fetchData={fetchData}
        data={tagList?.results || []}
        itemCount={tagList?.count || 0}
        pageCount={tagList?.numPages || 0}
        initialState={options}
        isExpandable
        // This is a temporary "bare bones" solution for brute-force loading all the child tags. In future we'll match
        // the Figma design and do something more sophisticated.
        renderRowSubComponent={({ row }) => (
          <SubTagsExpanded taxonomyId={taxonomyId} parentTagValue={row.original.value} />
        )}
        columns={[
          {
            Header: intl.formatMessage(messages.tagListColumnValueHeader),
            Cell: TagValue,
          },
          {
            id: 'expander',
            Header: DataTable.ExpandAll,
            Cell: OptionalExpandLink,
          },
        ]}
      >
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFoundMessage)} />
        {tagList?.numPages !== undefined && tagList?.numPages > 1
          && <DataTable.TableFooter />}
      </DataTable>
    </div>
  );
};

export default TagListTable;
