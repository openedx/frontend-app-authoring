import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import UnitIcon from './UnitIcon';
import { getCourseId, getSequenceId } from '../../data/selectors';

const UnitButton = ({
  unitId,
  className,
  showTitle,
}) => {
  const courseId = useSelector(getCourseId);
  const sequenceId = useSelector(getSequenceId);

  const unit = useSelector((state) => state.models.units[unitId]);

  const { title, contentType, isActive } = unit || {};

  return (
    <Button
      className={className}
      variant={isActive ? 'primary' : 'outline-primary'}
      as={Link}
      title={title}
      to={`/course/${courseId}/container/${unitId}/${sequenceId}/`}
      data-testid="course-unit-btn"
    >
      <UnitIcon type={contentType} />
      {showTitle && <span className="unit-title">{title}</span>}
    </Button>
  );
};

UnitButton.propTypes = {
  className: PropTypes.string,
  showTitle: PropTypes.bool,
  unitId: PropTypes.string.isRequired,
};

UnitButton.defaultProps = {
  className: undefined,
  showTitle: false,
};

export default UnitButton;
