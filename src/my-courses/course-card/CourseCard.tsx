/* eslint-disable linebreak-style */
import React from 'react';
import { Card, Button, IconButtonWithTooltip, Icon } from '@openedx/paragon';
import './CourseCard.scss';
import { Repeat } from '@openedx/paragon/icons';

type CourseCardProps = {
  imageSrc?: string;
  title: string;
  metadata: string;
  onViewLive?: () => void;
  onEditCourse?: () => void;
  onReRun?: () => void;
};

const fallbackImage = 'https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg';

const CourseCard: React.FC<CourseCardProps> = ({
  imageSrc,
  title,
  metadata,
  onViewLive,
  onEditCourse,
  onReRun,
}) => (
  <Card style={{ width: '19rem' }} className="course-card">
    <Card.ImageCap
      src={imageSrc === null ? fallbackImage : imageSrc}
      srcAlt="Course cover"
      className="course-card-image"
    />
    <Card.Section className="text-center card-content-section">
      <div className="title-container">
        <h6 className="card-title fw-bold">{title}</h6>
        <p className="text-muted small">{metadata}</p>
      </div>
      {/* <hr /> */}
      {/* <p className="text-muted">{metadata}</p> */}
      <div className="d-flex justify-content-between gap-2 course-card-buttons">
        <Button size="sm" variant="primary" onClick={onViewLive}>View live</Button>
        <Button size="sm" variant="outline-primary" onClick={onEditCourse}>Edit course</Button>
        <IconButtonWithTooltip src={Repeat} size="sm" variant="primary" iconAs={Icon} alt="Re-run" tooltipPlacement="bottom" tooltipContent="Re-run" onClick={onReRun} />
      </div>
    </Card.Section>
  </Card>
);

export default CourseCard;
