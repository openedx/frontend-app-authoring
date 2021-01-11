import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PageCard from './PageCard';

import messages from '../messages';

function PageGrid({ intl, pages }) {
  return (
    <div className="text-info-500">
      <h3 className="mt-3">
        {intl.formatMessage(messages['pages.subheading'])}
      </h3>
      <div className="d-flex flex-wrap align-items-stretch justify-content-stretch">
        {pages.map((page) => (
          <PageCard key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}

const pageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  showSettings: PropTypes.bool.isRequired,
  showStatus: PropTypes.bool.isRequired,
  showEnable: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
});

PageGrid.propTypes = {
  intl: intlShape.isRequired,
  pages: PropTypes.arrayOf(pageShape).isRequired,
};

export default injectIntl(PageGrid);
