import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

const ActionButton = ({ courseId, title }) => (
  <Button
    as={Link}
    to={`${getConfig().STUDIO_BASE_URL}/assets/${courseId}/`}
    size="sm"
  >
    {title}
  </Button>
);

ActionButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default ActionButton;
