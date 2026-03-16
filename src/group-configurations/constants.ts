import PropTypes from 'prop-types';

const availableGroupPropTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      usage: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
      version: PropTypes.number,
    }),
  ),
  id: PropTypes.number,
  name: PropTypes.string,
  parameters: PropTypes.shape({
    courseId: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  scheme: PropTypes.string,
  version: PropTypes.number,
};

const MESSAGE_VALIDATION_TYPES = {
  error: 'error',
  warning: 'warning',
};

export { MESSAGE_VALIDATION_TYPES, availableGroupPropTypes };
