import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { LIBRARY_TYPES, libraryShape } from '../common';
import messages from './messages';

const LibraryLink = ({
  type, url, children, ...attrs
}) => {
  if (type === LIBRARY_TYPES.LEGACY) {
    return (
      <a href={url} {...attrs}>
        {children}
      </a>
    );
  }

  return (
    <Link to={url} {...attrs}>
      {children}
    </Link>
  );
};

LibraryLink.propTypes = {
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const LibraryListItem = ({ intl, library }) => (
  <LibraryLink type={library.type} url={library.url} className="library-link">
    <h3 className="library-title">{library.title}</h3>
    <div className="library-metadata">
      <span className="library-type metadata-item">
        <span className="label">{intl.formatMessage(messages['library.list.item.type'])}</span>
        <span className="value">{intl.formatMessage(messages[`library.list.item.type.${library.type}`])}</span>
      </span>
      <span className="library-org metadata-item">
        <span className="label">{intl.formatMessage(messages['library.list.item.organization'])}</span>
        <span className="value">{library.org}</span>
      </span>
      <span className="library-slug metadata-item">
        <span className="label">{intl.formatMessage(messages['library.list.item.slug'])}</span>
        <span className="value">{library.slug}</span>
      </span>
    </div>
  </LibraryLink>
);

LibraryListItem.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
};

export default injectIntl(LibraryListItem);
