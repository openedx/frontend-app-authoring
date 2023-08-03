import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Toast } from '@edx/paragon';
import messages from './messages';

const ApiStatusToast = ({
  actionType,
  selectedRowCount,
  isOpen,
  setClose,
  setSelectedRowCount,
  // injected
  intl,
}) => {
  const handleClose = () => {
    setSelectedRowCount(0);
    setClose();
  };

  return (
    <Toast
      show={isOpen}
      onClose={handleClose}
    >
      {intl.formatMessage(messages.apiStatusToastMessage, { actionType, selectedRowCount })}
    </Toast>
  );
};

ApiStatusToast.propTypes = {
  actionType: PropTypes.string.isRequired,
  selectedRowCount: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setClose: PropTypes.func.isRequired,
  setSelectedRowCount: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ApiStatusToast);
