import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, Pagination, DataTable } from '@edx/paragon';

const TablePagination = ({
  totalCount,
  currentPage,
  handlePageChange,
}) => (
  <ActionRow>
    <DataTable.RowStatus />
    <ActionRow.Spacer />
    <Pagination.Reduced
      currentPage={currentPage}
      handlePageSelect={(pageNum) => handlePageChange(pageNum)}
      pageCount={Math.ceil(totalCount / 50)}
    />
    <ActionRow.Spacer />
    <Pagination
      variant="minimal"
      currentPage={currentPage}
      pageCount={Math.ceil(totalCount / 50)}
      paginationLabel="select content pagination"
      onPageSelect={(pageNum) => handlePageChange(pageNum)}
    />
  </ActionRow>
);

TablePagination.propTypes = {
  totalCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
};

export default TablePagination;
