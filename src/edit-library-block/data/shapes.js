import PropTypes from 'prop-types';
import { fetchable } from '@src/library-authoring/common';

export const blockMetadataShape = PropTypes.shape({
  block_type: PropTypes.string.isRequired,
  has_unpublished_changes: PropTypes.bool.isRequired,
});

export const blockViewShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
});

export const blockStateShape = PropTypes.shape({
  errorMessage: PropTypes.string,
  metadata: fetchable(blockMetadataShape).isRequired,
  assets: fetchable(PropTypes.arrayOf(PropTypes.string)).isRequired,
  olx: fetchable(PropTypes.string).isRequired,
  view: fetchable(blockViewShape).isRequired,
  // String just placed here as placeholder. We never set a value, just track status.
  deletion: fetchable(PropTypes.string).isRequired,
});

export const blockStatesShape = PropTypes.objectOf(blockStateShape);
