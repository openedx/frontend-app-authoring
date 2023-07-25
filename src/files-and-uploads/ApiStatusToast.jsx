import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { DataTableContext, Toast } from '@edx/paragon';
import { RequestStatus } from '../data/constants';

const ApiStatusToast = ({
  actionType,
  apiStatus,
}) => {
  const { selectedFlatRows } = useContext(DataTableContext);
  const name = selectedFlatRows[0]?.row?.original?.displayName;
  const fileCount = selectedFlatRows?.length;
  console.log(apiStatus);
  console.log(apiStatus === RequestStatus.IN_PROGRESS);
  console.log(fileCount, selectedFlatRows);
  return (
    <Toast
      show={apiStatus === RequestStatus.IN_PROGRESS}
    >
      {fileCount > 1 ? (
        `You have ${actionType} ${fileCount} files`
      ) : (
        `You have ${actionType} "${name}"`
      )}
    </Toast>
  );
};

ApiStatusToast.propTypes = {
  actionType: PropTypes.string.isRequired,
  apiStatus: PropTypes.string.isRequired,
};

export default injectIntl(ApiStatusToast);
