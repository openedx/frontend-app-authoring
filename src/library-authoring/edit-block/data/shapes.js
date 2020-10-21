import PropTypes from 'prop-types';
import { LOADING_STATUS } from '../../common/data';

export const blockMetadataShape = PropTypes.shape({
  block_type: PropTypes.string.isRequired,
  has_unpublished_changes: PropTypes.bool.isRequired,
});

export const blockViewShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
});

export const blockStateShape = PropTypes.shape({
  metadata: blockMetadataShape,
  assets: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessage: PropTypes.string,
  olx: PropTypes.string,
  status: PropTypes.oneOf([LOADING_STATUS.LOADING, LOADING_STATUS.FAILED, LOADING_STATUS.LOADED]),
  view: blockViewShape,
});

export const blocksShape = PropTypes.objectOf(blockStateShape);
