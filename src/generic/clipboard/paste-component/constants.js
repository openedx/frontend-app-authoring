import PropTypes from 'prop-types';

/* eslint-disable import/prefer-default-export */
export const clipboardPropsTypes = {
  sourceEditUrl: PropTypes.string.isRequired,
  content: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    blockTypeDisplay: PropTypes.string.isRequired,
  }).isRequired,
  sourceContextTitle: PropTypes.string.isRequired,
};
