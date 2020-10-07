import PropTypes from 'prop-types';

export const libraryBlockShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  def_key: PropTypes.string.isRequired,
  block_type: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
  has_unpublished_changes: PropTypes.bool.isRequired,
});

export const libraryBlockTypeShape = PropTypes.shape({
  block_type: PropTypes.string.isRequired,
  display_name: PropTypes.string.isRequired,
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
  blocks: PropTypes.arrayOf(libraryBlockShape),
  blockTypes: PropTypes.arrayOf(libraryBlockTypeShape),
});

export const commonsOptionsShape = PropTypes.shape({
  attribution: PropTypes.bool.isRequired,
  nonCommercial: PropTypes.bool.isRequired,
  noDerivatives: PropTypes.bool.isRequired,
  shareAlike: PropTypes.bool.isRequired,
});
