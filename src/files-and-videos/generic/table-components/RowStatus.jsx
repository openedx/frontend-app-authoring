import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTableContext } from '@openedx/paragon';
import { getCurrentViewRange } from './utils';

const RowStatus = () => {
  const intl = useIntl();
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

export default RowStatus;
