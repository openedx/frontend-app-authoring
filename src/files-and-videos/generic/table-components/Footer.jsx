import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataTableContext, Pagination, TableFooter } from '@edx/paragon';

const Footer = ({
  setInitialState,
}) => {
  const {
    pageOptions, pageCount, gotoPage, state,
  } = useContext(DataTableContext);

  // This useEffect saves DataTable state so it can persist after table re-renders due to data reload.
  useEffect(() => {
    setInitialState(state);
  }, [state]);

  if (pageOptions.length < 2) {
    return null;
  }

  const pageIndex = state?.pageIndex;

  return (
    <TableFooter>
      <Pagination
        size="small"
        currentPage={pageIndex + 1}
        pageCount={pageCount}
        paginationLabel="table pagination"
        onPageSelect={(pageNum) => gotoPage(pageNum - 1)}
      />
    </TableFooter>
  );
};

Footer.propTypes = {
  setInitialState: PropTypes.func.isRequired,
};

export default Footer;
