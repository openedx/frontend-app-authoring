import { Col, Icon, Row } from '@openedx/paragon';
import { ArrowRight, DragIndicator } from '@openedx/paragon/icons';
import { ContainerType } from '@src/generic/key-utils';
import { getItemStatusBorder } from '../utils';

interface ItemProps {
  displayName: string;
  status: string;
}

interface CourseItemOverlayProps extends ItemProps {
  category: string;
}

const commonStyle = {
  padding: '1rem 1.5rem',
  marginBottom: '1.5rem',
  borderRadius: '0.35rem',
  boxShadow: '0 0 .125rem rgba(0, 0, 0, .15), 0 0 .25rem rgba(0, 0, 0, .15)',
};

const DragIndicatorBtn = () => (
  <button
    key="drag-to-reorder-icon"
    className="btn-icon btn-icon-secondary btn-icon-md"
    type="button"
  >
    <span className="btn-icon__icon-container">
      <Icon src={DragIndicator} />
    </span>
  </button>
);

const SectionCard = ({ status, displayName }: ItemProps) => {
  const style = {
    ...commonStyle,
    paddingTop: '2rem',
    paddingBottom: '5rem',
    ...getItemStatusBorder(status),
  };

  return (
    <Row
      style={style}
      className="mx-0 bg-white"
    >
      <Col className="extend-margin px-0">
        <div className="item-card-header h3">
          <Icon src={ArrowRight} className="mr-2" />
          {displayName}
        </div>
      </Col>
      <DragIndicatorBtn />
    </Row>
  );
};

const SubsectionCard = ({ status, displayName }: ItemProps) => {
  const style = {
    ...commonStyle,
    paddingTop: '1rem',
    paddingBottom: '2.5rem',
    ...getItemStatusBorder(status),
  };

  return (
    <Row
      style={style}
      className="mx-0 bg-light-200"
    >
      <Col className="extend-margin px-0">
        <div className="item-card-header h4 pt-2">
          <Icon src={ArrowRight} className="mr-2" />
          {displayName}
        </div>
      </Col>
      <DragIndicatorBtn />
    </Row>
  );
};

const UnitCard = ({ status, displayName }: ItemProps) => {
  const style = {
    ...commonStyle,
    paddingBottom: '1.5rem',
    ...getItemStatusBorder(status),
  };

  return (
    <Row
      style={style}
      className="mx-0 bg-white"
    >
      <Col className="extend-margin px-0">
        <div className="item-card-header h5 pt-3">
          {displayName}
        </div>
      </Col>
      <DragIndicatorBtn />
    </Row>
  );
};

const CourseItemOverlay = ({ category, displayName, status }: CourseItemOverlayProps) => {
  switch (category) {
    case ContainerType.Chapter:
      return <SectionCard displayName={displayName} status={status} />;
    case ContainerType.Sequential:
      return <SubsectionCard displayName={displayName} status={status} />;
    case ContainerType.Vertical:
      return <UnitCard displayName={displayName} status={status} />;
    default:
      throw new Error(`Invalid course item type: ${category}`);
  }
};

export default CourseItemOverlay;
