import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow, Pagination, DataTable } from '@edx/paragon';

const TablePagination = ({
  totalCount,
  currentPage,
  handlePageChange,
}) => {
  const pageCount = totalCount ? Math.ceil(totalCount / 50) : 1;

  return (
    <ActionRow>
      <DataTable.RowStatus />
      <ActionRow.Spacer />
      <Pagination
        variant="reduced"
        paginationLabel="select content pagination"
        currentPage={currentPage}
        onPageSelect={(pageNum) => handlePageChange(pageNum)}
        pageCount={pageCount}
      />
      <ActionRow.Spacer />
      <Pagination
        variant="minimal"
        currentPage={currentPage}
        pageCount={pageCount}
        paginationLabel="select content pagination"
        onPageSelect={(pageNum) => handlePageChange(pageNum)}
      />
    </ActionRow>
  );
};

TablePagination.propTypes = {
  totalCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
};

export default TablePagination;
