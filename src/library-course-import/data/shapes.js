import PropTypes from 'prop-types';

export const courseShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

export const importTaskShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  library: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  course_id: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
});
