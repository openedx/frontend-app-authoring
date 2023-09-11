import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  OverlayTrigger,
  Tooltip,
} from '@edx/paragon';
import { getPagePath } from '../utils';
import messages from './messages';

const CourseLockUp = ({
  courseId,
  courseOrg,
  courseNumber,
  courseTitle,
  // injected
  intl,
}) => (
  <OverlayTrigger
    placement="bottom"
    overlay={(
      <Tooltip id="course-lock-up">
        {courseTitle}
      </Tooltip>
    )}
  >
    <a
      className="course-title-lockup w-25 mr-2"
      href={getPagePath(courseId, process.env.ENABLE_NEW_COURSE_OUTLINE_PAGE, 'course')}
      aria-label={intl.formatMessage(messages['header.label.courseOutline'])}
      data-testid="course-lock-up-block"
    >
      <span className="d-block small m-0" data-testid="course-org-number">{courseOrg} {courseNumber}</span>
      <span className="d-block m-0 font-weight-bold" data-testid="course-title">{courseTitle}</span>
    </a>
  </OverlayTrigger>
);

CourseLockUp.propTypes = {
  courseId: PropTypes.string,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

CourseLockUp.defaultProps = {
  courseNumber: null,
  courseOrg: null,
  courseId: null,
  courseTitle: null,
};

export default injectIntl(CourseLockUp);
