import PropTypes from 'prop-types';
import { LOADING_STATUS } from './constants';

export const libraryBlockTypeShape = PropTypes.shape({
  block_type: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
});

export const libraryBlockShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  def_key: PropTypes.string.isRequired,
  block_type: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
  has_unpublished_changes: PropTypes.bool.isRequired,
});

export const libraryShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  bundle_uuid: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  version: PropTypes.number,
  license: PropTypes.string.isRequired,
  has_unpublished_changes: PropTypes.bool.isRequired,
  has_unpublished_deletes: PropTypes.bool.isRequired,
  blockTypes: PropTypes.arrayOf(libraryBlockTypeShape),
  allow_lti: PropTypes.bool.isRequired,
});

export const commonsOptionsShape = PropTypes.shape({
  attribution: PropTypes.bool.isRequired,
  nonCommercial: PropTypes.bool.isRequired,
  noDerivatives: PropTypes.bool.isRequired,
  shareAlike: PropTypes.bool.isRequired,
});

export const statusShape = PropTypes.oneOf(Object.values(LOADING_STATUS));

export const fetchable = (valueShape) => PropTypes.shape({
  status: statusShape,
  value: valueShape,
});

export const paginated = (dataShape) => PropTypes.shape({
  data: PropTypes.arrayOf(dataShape),
  count: PropTypes.number,
});
