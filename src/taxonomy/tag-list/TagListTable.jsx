// ts-check
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';
import _ from 'lodash';
import Proptypes from 'prop-types';
import { useState } from 'react';

import { LoadingSpinner } from '../../generic/Loading';
import messages from './messages';
import { useTagListDataResponse, useTagListDataStatus } from './data/apiHooks';
import { useSubTags } from './data/api';

const SubTagsExpanded = ({ taxonomyId, parentTagValue }) => {
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
          {tagData.value} <span className="text-secondary-500">{tagData.childCount > 0 ? `(${tagData.childCount})` : null}</span>
        </li>
      ))}
    </ul>
  );
};

SubTagsExpanded.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
  parentTagValue: Proptypes.string.isRequired,
};

/**
 * An "Expand" toggle to show/hide subtags, but one which is hidden if the given tag row has no subtags.
 */
const OptionalExpandLink = ({ row }) => (row.original.childCount > 0 ? <DataTable.ExpandRow row={row} /> : null);
OptionalExpandLink.propTypes = DataTable.ExpandRow.propTypes;

/**
 * Custom DataTable cell to join tag value with child count
 */
const TagValue = ({ row }) => (
  <>
    <span>{row.original.value}</span>
    <span className="text-secondary-500">{` (${row.original.childCount})`}</span>
  </>
);
TagValue.propTypes = DataTable.TableCell.propTypes;

const TagListTable = ({ taxonomyId }) => {
  const intl = useIntl();
  const [options, setOptions] = useState({
    pageIndex: 0,
  });
  const { isLoading } = useTagListDataStatus(taxonomyId, options);
  const tagList = useTagListDataResponse(taxonomyId, options);

  const fetchData = (args) => {
    if (!_.isEqual(args, options)) {
      setOptions({ ...args });
    }
  };

  return (
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
      <DataTable.TableControlBar />
      <DataTable.Table />
      <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFoundMessage)} />
      <DataTable.TableFooter />
    </DataTable>
  );
};

TagListTable.propTypes = {
  taxonomyId: Proptypes.number.isRequired,
};

export default TagListTable;
