import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';

const AddContentHeader = () => (
  <span className="font-weight-bold m-1.5">
    <FormattedMessage {...messages.addContentTitle} />
  </span>
);

export default AddContentHeader;
