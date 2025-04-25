/* eslint-disable linebreak-style */
import React from 'react';
import { Card, Button } from '@openedx/paragon';
import './CourseCard.scss';

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
  <Card style={{ width: '18rem' }} className="course-card">
    <Card.ImageCap
      src={imageSrc === null ? fallbackImage : imageSrc}
      srcAlt="Course cover"
      className="course-card-image"
    />
    <Card.Section className="text-center p-4">
      <div className="title-container">
        <h6 className="card-title fw-bold">{title}</h6>
      </div>
      <hr />
      <p className="text-muted small">{metadata}</p>
      <div className="d-flex justify-content-between mt-3 gap-2 course-card-buttons">
        <Button size="sm" variant="primary" onClick={onViewLive}>View live</Button>
        <Button size="sm" variant="outline-primary" onClick={onEditCourse}>Edit course</Button>
        <Button size="sm" variant="primary" onClick={onReRun}>Re-run</Button>
      </div>
    </Card.Section>
  </Card>
);

export default CourseCard;
