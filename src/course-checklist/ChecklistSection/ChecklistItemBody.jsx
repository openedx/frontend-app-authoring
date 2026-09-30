import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, Icon } from '@openedx/paragon';
import { CheckCircle, RadioButtonUnchecked } from '@openedx/paragon/icons';
import { useCourseUserPermissions } from '@src/authz/hooks';
import * as permissionHelpers from '@src/authz/permissionHelpers';

import messages from './messages';

const getUpdateLinks = (courseId) => ({
  welcomeMessage: `/course/${courseId}/course_info`,
  gradingPolicy: `/course/${courseId}/settings/grading`,
  certificate: `/course/${courseId}/certificates`,
  courseDates: `/course/${courseId}/settings/details/#schedule`,
  proctoringEmail: `/course/${courseId}/pages-and-resources/proctoring/settings`,
  outline: `/course/${courseId}`,
});

const ChecklistItemBody = ({
  courseId,
  checkId,
  isCompleted,
}) => {
  const intl = useIntl();
  const updateLinks = getUpdateLinks(courseId);
  const perms = useCourseUserPermissions(courseId, {
    ...permissionHelpers.getCourseUpdatesPermissions(courseId),
    ...permissionHelpers.getGradingPermissions(courseId),
    ...permissionHelpers.getCertificatesPermissions(courseId),
    ...permissionHelpers.getScheduleAndDetailsPermissions(courseId),
    ...permissionHelpers.getPagesAndResourcesPermissions(courseId),
  });
  // Each update link is only shown if the user can make changes on the page it points to.
  const canUpdate = {
    welcomeMessage: perms.canManageCourseUpdates,
    gradingPolicy: perms.canEditGradingSettings,
    certificate: perms.canManageCertificates,
    courseDates: perms.canEditSchedule,
    proctoringEmail: perms.canManagePagesAndResources,
  };
  const showUpdateLink = !!updateLinks?.[checkId] && !!canUpdate[checkId];

  return (
    <ActionRow>
      <div className="mr-3" id={`icon-${checkId}`} data-testid={`icon-${checkId}`}>
        {isCompleted ?
          (
            <Icon
              data-testid="completed-icon"
              src={CheckCircle}
              className="text-success"
              style={{ height: '32px', width: '32px' }}
              screenReaderText={intl.formatMessage(messages.completedItemLabel)}
            />
          ) :
          (
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
      {showUpdateLink && (
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
