import PropTypes from 'prop-types';
import { LIBRARY_ACCESS } from '../../common/data';

// eslint-disable-next-line import/prefer-default-export
export const libraryUserShape = PropTypes.shape({
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  access_level: PropTypes.oneOf([...Object.values(LIBRARY_ACCESS)]),
});
