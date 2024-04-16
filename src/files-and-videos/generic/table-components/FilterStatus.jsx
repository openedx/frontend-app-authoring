import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTableContext, Button, Row, Chip,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { getFilters, removeFilter } from './utils';

const FilterStatus = ({
  className, variant, size, clearFiltersText, buttonClassName,
}) => {
  const intl = useIntl();
  const {
    state, setAllFilters, setFilter, RowStatusComponent, columns,
  } = useContext(DataTableContext);

  if (!setAllFilters) {
    return null;
  }

  const filters = getFilters(state, columns);

  return (
    <div className={className}>
      <RowStatusComponent />
      <Row className="m-0 align-items-center">
        <span className="mr-2">Filters applied</span>
        {filters.map(({ name, value }) => (
          <Chip
            key={value}
            iconAfter={Close}
            iconAfterAlt={intl.formatMessage({
              id: 'pgn.DataTable.FilterStatus.removeFilter',
              defaultMessage: 'Remove this filter',
              description: 'Remove one of the applied filters.',
            })}
            onIconAfterClick={() => removeFilter(value, setFilter, setAllFilters, state)}
          >
            {name}
          </Chip>
        ))}
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
      </Row>
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
