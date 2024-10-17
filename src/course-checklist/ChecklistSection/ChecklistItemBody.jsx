import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Hyperlink,
  Icon,
} from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { CheckCircle, RadioButtonUnchecked } from '@openedx/paragon/icons';

import messages from './messages';

const ChecklistItemBody = ({
  courseId,
  checkId,
  isCompleted,
  updateLink,
  // injected
  intl,
}) => {
  const waffleFlags = useSelector(state => state.courseDetail.waffleFlags);
  const navigate = useNavigate();

  const handleClick = (e, url) => {
    e.preventDefault();

    if (waffleFlags?.useNewUpdatesPage) {
      navigate(`/course/${courseId}/course_info`);
    } else {
      window.location.href = url;
    }
  };

  return (
    <ActionRow>
      <div className="mr-3" id={`icon-${checkId}`} data-testid={`icon-${checkId}`}>
        {isCompleted ? (
          <Icon
            data-testid="completed-icon"
            src={CheckCircle}
            className="text-success"
            style={{ height: '32px', width: '32px' }}
            screenReaderText={intl.formatMessage(messages.completedItemLabel)}
          />
        ) : (
          <Icon
            data-testid="uncompleted-icon"
            src={RadioButtonUnchecked}
            style={{ height: '32px', width: '32px' }}
            screenReaderText={intl.formatMessage(messages.uncompletedItemLabel)}
          />
        )}
      </div>
      <div>
        <div>
          <FormattedMessage {...messages[`${checkId}ShortDescription`]} />
        </div>
        <div className="small">
          <FormattedMessage {...messages[`${checkId}LongDescription`]} />
        </div>
      </div>
      <ActionRow.Spacer />
      {updateLink && (
        <Hyperlink
          destination={updateLink}
          data-testid="update-hyperlink"
          onClick={(e) => handleClick(e, updateLink)}
        >
          <Button size="sm">
            <FormattedMessage {...messages.updateLinkLabel} />
          </Button>
        </Hyperlink>
      )}
    </ActionRow>
  );
};

ChecklistItemBody.defaultProps = {
  updateLink: null,
};

ChecklistItemBody.propTypes = {
  courseId: PropTypes.string.isRequired,
  checkId: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  updateLink: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ChecklistItemBody);
