import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { DataTableContext, Button } from '@edx/paragon';

const FilterStatus = ({
  className, variant, size, clearFiltersText, buttonClassName,
}) => {
  const {
    setAllFilters, RowStatusComponent, page, rows,
  } = useContext(DataTableContext);
  if (!setAllFilters) {
    return null;
  }

  const RowStatus = RowStatusComponent;

  const pageSize = page?.length || rows?.length;

  return (
    <div className={className}>
      <div className="pl-1">
        <span>Filters applied</span>
        {!!pageSize && ' ('}
        <RowStatus className="d-inline" />
        {!!pageSize && ')'}
      </div>
      <Button
        className={buttonClassName}
        variant={variant}
        size={size}
        onClick={() => setAllFilters([])}
      >
        {clearFiltersText === undefined
          ? (
            <FormattedMessage
              id="pgn.DataTable.FilterStatus.clearFiltersText"
              defaultMessage="Clear filters"
              description="A text that appears on the `Clear filters` button"
            />
          )
          : clearFiltersText}
      </Button>
    </div>
  );
};

FilterStatus.defaultProps = {
  /** Specifies class name to append to the base element. */
  className: null,
  /** Specifies class name to append to the button. */
  buttonClassName: 'pgn__smart-status-button',
  /** The visual style of the `FilterStatus`. */
  variant: 'link',
  /** The size of the `FilterStatus`. */
  size: 'inline',
  /** A text that appears on the `Clear filters` button, defaults to 'Clear filters'. */
  clearFiltersText: undefined,
};

FilterStatus.propTypes = {
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  clearFiltersText: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default FilterStatus;
