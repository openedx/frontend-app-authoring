import PropTypes from 'prop-types';

export const clipboardPropsTypes = {
  sourceEditUrl: PropTypes.string.isRequired,
  content: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    blockTypeDisplay: PropTypes.string.isRequired,
  }).isRequired,
  sourceContextTitle: PropTypes.string.isRequired,
};
