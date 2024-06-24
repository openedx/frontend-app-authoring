// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

/**
 * @type {React.FC}
 */
const LibraryCollections = () => (
  <div className="d-flex my-6 justify-content-center">
    <FormattedMessage
      {...messages.collectionsTempPlaceholder}
    />
  </div>
);

export default LibraryCollections;
