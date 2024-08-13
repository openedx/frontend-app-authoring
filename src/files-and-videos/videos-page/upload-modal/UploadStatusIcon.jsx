import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Spinner } from '@openedx/paragon';
import { Check, ErrorOutline } from '@openedx/paragon/icons';
import { RequestStatus } from '../../../data/constants';

const UploadStatusIcon = ({ status }) => {
  switch (status) {
    case RequestStatus.SUCCESSFUL:
      return (<Icon src={Check} />);
    case RequestStatus.FAILED:
      return (<Icon src={ErrorOutline} />);
    case RequestStatus.IN_PROGRESS:
      return (
        <Spinner
          animation="border"
          size="sm"
          screenReaderText="Loading"
        />
      );
    default:
      return (<div style={{ width: '24px' }} />);
  }
};

UploadStatusIcon.defaultProps = {
  status: null,
};
UploadStatusIcon.propTypes = {
  status: PropTypes.string,
};

export default UploadStatusIcon;
