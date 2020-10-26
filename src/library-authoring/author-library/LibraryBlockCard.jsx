import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { ROUTES, libraryBlockShape, BLOCK_TYPE_EDIT_DENYLIST } from '../common';
import messages from './messages';

const LibraryBlockCard = ({ block, intl, libraryId }) => (
  <div className="col-sm-4 mb-4" key={block.id}>
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">{block.display_name}</h3>
        <p>
          {block.block_type}<br />
          <small className="text-muted">{block.id}</small>
        </p>
        {block.has_unpublished_changes
          ? <p className="badge badge-info">{intl.formatMessage(messages['library.detail.block.unpublished_changes'])}</p>
          : null}
      </div>
      <div className="card-footer">
        <Link to={ROUTES.Block.HOME_SLUG(libraryId, block.id)} className="btn btn-sm btn-outline-primary mr-2">
          {intl.formatMessage(messages['library.detail.block.view_link'])}
        </Link>
        {BLOCK_TYPE_EDIT_DENYLIST.includes(block.block_type) || (
          <Link to={ROUTES.Block.EDIT_SLUG(libraryId, block.id)} className="btn btn-sm btn-outline-secondary mr-2">
            {intl.formatMessage(messages['library.detail.block.edit_link'])}
          </Link>
        )}
      </div>
    </div>
  </div>
);

LibraryBlockCard.propTypes = {
  block: libraryBlockShape.isRequired,
  intl: intlShape.isRequired,
  libraryId: PropTypes.string.isRequired,
};

export default injectIntl(LibraryBlockCard);
