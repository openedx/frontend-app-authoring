// ts-check
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
} from '@edx/paragon';
import _ from 'lodash';
import Proptypes from 'prop-types';
import { useState } from 'react';

import messages from './messages';
import { useTagListDataResponse, useTagListDataStatus } from './data/selectors';

const TagListTable = ({ taxonomyId }) => {
  const intl = useIntl();

  const [options, setOptions] = useState({
    pageIndex: 0,
  });

  const useTagListData = () => {
    const { isError, isFetched, isLoading } = useTagListDataStatus(taxonomyId, options);
    const tagList = useTagListDataResponse(taxonomyId, options);
    return {
      isError,
      isFetched,
      isLoading,
      tagList,
    };
  };

  const { tagList, isLoading } = useTagListData();

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
      columns={[
        {
          Header: intl.formatMessage(messages.tagListColumnValueHeader),
          accessor: 'value',
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
  taxonomyId: Proptypes.string.isRequired,
};

export default TagListTable;
