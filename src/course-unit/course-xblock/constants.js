import PropTypes from 'prop-types';

export const IFRAME_FEATURE_POLICY = (
  'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;'
);

export const MESSAGE_ERROR_TYPES = {
  error: 'error',
  warning: 'warning',
};

export const IFRAME_LOADING_STATUS = {
  STANDBY: 'standby', // Structure has been created but is not yet loading.
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};

export const statusShape = PropTypes.oneOf(Object.values(IFRAME_LOADING_STATUS));

export const fetchable = (valueShape) => PropTypes.shape({
  status: statusShape,
  value: valueShape,
});

export const blockViewShape = PropTypes.shape({
  content: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
});

export const STYLE_TAG_PATTERN = /<style[^>]*>([\s\S]*?)<\/style>/gi;
