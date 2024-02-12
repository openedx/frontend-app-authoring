import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { Button } from '@edx/paragon';
import { Link } from 'react-router-dom';

import UnitIcon from './UnitIcon';

const UnitButton = ({
  title, contentType, isActive, unitId, className, showTitle,
}) => {
  const courseId = useSelector(state => state.courseUnit.courseId);
  const sequenceId = useSelector(state => state.courseUnit.sequenceId);

  return (
    <Button
      className={className}
      variant={isActive ? 'primary' : 'outline-primary'}
      as={Link}
      title={title}
      to={`/course/${courseId}/container/${unitId}/${sequenceId}/`}
    >
      <UnitIcon type={contentType} />
      {showTitle && <span className="unit-title">{title}</span>}
    </Button>
  );
};

UnitButton.propTypes = {
  className: PropTypes.string,
  contentType: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  showTitle: PropTypes.bool,
  title: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

UnitButton.defaultProps = {
  className: undefined,
  isActive: false,
  showTitle: false,
};

const mapStateToProps = (state, props) => {
  if (props.unitId) {
    return {
      ...state.models.units[props.unitId],
    };
  }
  return {};
};

export default connect(mapStateToProps)(UnitButton);
