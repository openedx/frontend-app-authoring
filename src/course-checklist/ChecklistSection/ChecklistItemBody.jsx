import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, Icon } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { CheckCircle, RadioButtonUnchecked } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

import { getWaffleFlags } from '../../data/selectors';
import messages from './messages';

const getUpdateLinks = (courseId, waffleFlags) => {
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const isLegacyGradingUrl = !waffleFlags.useNewGradingPage;
  const isLegacyCertificateUrl = !waffleFlags.useNewCertificatesPage;
  const isLegacyCourseDatesUrl = !waffleFlags.useNewScheduleDetailsPage;
  const isLegacyOutlineUrl = !waffleFlags.useNewCourseOutlinePage;

  return {
    welcomeMessage: `/course/${courseId}/course_info`,
    gradingPolicy: isLegacyGradingUrl
      ? `${baseUrl}/settings/grading/${courseId}` : `/course/${courseId}/settings/grading`,
    certificate: isLegacyCertificateUrl
      ? `${baseUrl}/certificates/${courseId}` : `/course/${courseId}/certificates`,
    courseDates: isLegacyCourseDatesUrl
      ? `${baseUrl}/settings/details/${courseId}#schedule` : `/course/${courseId}/settings/details/#schedule`,
    proctoringEmail: `${baseUrl}/pages-and-resources/proctoring/settings`,
    outline: isLegacyOutlineUrl ? `${baseUrl}/course/${courseId}` : `/course/${courseId}`,
  };
};

const ChecklistItemBody = ({
  courseId,
  checkId,
  isCompleted,
}) => {
  const intl = useIntl();
  const waffleFlags = useSelector(getWaffleFlags);
  const updateLinks = getUpdateLinks(courseId, waffleFlags);

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
      {updateLinks?.[checkId] && (
        <Link
          to={updateLinks[checkId]}
          data-testid="update-link"
        >
          <Button size="sm">
            <FormattedMessage {...messages.updateLinkLabel} />
          </Button>
        </Link>
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
};

export default ChecklistItemBody;
