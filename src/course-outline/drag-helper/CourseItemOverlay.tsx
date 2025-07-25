import { Col, Icon, Row } from "@openedx/paragon";
import { DragIndicator } from "@openedx/paragon/icons";
import { getItemStatusBorder } from "../utils";

interface CourseItemOverlayProps {
  category: string;
  displayName: string;
  status: string;
}

const CourseItemOverlay = ({ category, displayName, status }: CourseItemOverlayProps) => {
  let paddingExtra = 1;
  let backgroundColorClass = 'bg-white';
  switch (category) {
    case "sequential":
      paddingExtra = 2;
      backgroundColorClass = 'bg-light-200';
      break;
    case "chapter":
      paddingExtra = 3;
      break;
    default:
      break;
  }

  const style = {
    padding: `1rem 1.5rem ${1 + paddingExtra}rem`,
    marginBottom: '1.5rem',
    borderRadius: '0.35rem',
    boxShadow: '0 0 .125rem rgba(0, 0, 0, .15), 0 0 .25rem rgba(0, 0, 0, .15)',
    ...getItemStatusBorder(status),
  }

  return (
    <Row
      style={style}
      className={`mx-0 ${backgroundColorClass}`}
    >
      <Col className="extend-margin px-0">
        <div className="item-card-header font-weight-bold">
          {displayName}
        </div>
      </Col>
      <button
        key="drag-to-reorder-icon"
        className="btn-icon btn-icon-secondary btn-icon-md"
        type="button"
      >
        <span className="btn-icon__icon-container">
          <Icon src={DragIndicator} />
        </span>
      </button>
    </Row>
  )
}

export default CourseItemOverlay
