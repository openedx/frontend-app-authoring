import PropTypes from 'prop-types';

const libraryShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  bundle_uuid: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  version: PropTypes.number,
  has_unpublished_changes: PropTypes.bool.isRequired,
  has_unpublished_deletes: PropTypes.bool.isRequired,
});

export default libraryShape;
