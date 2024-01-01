import React, { useContext } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTableContext } from '@openedx/paragon';
import { getCurrentViewRange } from './utils';

const RowStatus = ({
  // injected
  intl,
}) => {
  const { filteredRows, page, initialRows } = useContext(DataTableContext);

  return (
    <div>
      <span>
        {getCurrentViewRange({
          filterRowCount: filteredRows.length,
          initialRowCount: initialRows.length,
          fileCount: page.length,
          intl,
        })}
      </span>
    </div>
  );
};

RowStatus.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RowStatus);
