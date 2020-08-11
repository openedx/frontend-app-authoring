import React from 'react';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

ensureConfig(['STUDIO_BASE_URL'], 'library index tabs');

/**
 * Reproduces the Studio tabs statically, primarily so there's a way to return to Studio from the MFE.
 */
const LibraryIndexTabs = ({ intl }) => (
  <ul className="library-index-tabs">
    <li className="courses-tab">
      <a href={`${getConfig().STUDIO_BASE_URL}/home/`}>{intl.formatMessage(messages['library.common.tabs.courses'])}</a>
    </li>
    <li className="active"><span>{intl.formatMessage(messages['library.common.tabs.libraries'])}</span></li>
  </ul>
);

LibraryIndexTabs.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LibraryIndexTabs);
