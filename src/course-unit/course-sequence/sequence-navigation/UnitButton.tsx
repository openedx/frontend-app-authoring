import { type FC } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { DeprecatedReduxState } from '@src/store';
import { getSequenceId } from '@src/course-unit/data/selectors';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import UnitIcon from './UnitIcon';

interface Props {
  unitId: string;
  className?: string;
  showTitle?: boolean;
  isActive?: boolean;
}

const UnitButton: FC<Props> = ({
  unitId,
  className,
  isActive, // passed from parent (SequenceNavigationTabs)
  showTitle = false,
}) => {
  const { courseId } = useCourseAuthoringContext();
  const sequenceId = useSelector(getSequenceId);

  const unit = useSelector((state: DeprecatedReduxState) => state.models.units[unitId]);
  const { title, contentType } = unit || {};

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

export default UnitButton;
