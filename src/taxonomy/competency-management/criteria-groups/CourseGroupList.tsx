import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import CourseGroupSection from './CourseGroupSection';
import messages from './messages';
// @ts-ignore
import './criteria-groups.scss';

/** The associations tree for the selected competency: loading, failed, empty, or the
 * accessible course-level groups. A course whose outline returns 403 or 404 is hidden,
 * and any other outline failure shows the error state.
 */
const CourseGroupList = () => {
  const intl = useIntl();
  const {
    status,
    accessibleCourseGroups,
  } = useCompetencyAssociations();

  if (status === 'pending') {
    return (
      <div className="d-flex justify-content-center py-3">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <AlertMessage
        variant="danger"
        description={intl.formatMessage(messages.courseGroupListErrorMessage)}
      />
    );
  }

  if (accessibleCourseGroups.length === 0) {
    return (
      <div className="course-group-list__empty-state">
        <p>{intl.formatMessage(messages.noAssociationsMessage)}</p>
        <p>{intl.formatMessage(messages.noAssociationsPromptMessage)}</p>
      </div>
    );
  }

  return (
    <Stack gap={3} className="course-group-list">
      {accessibleCourseGroups.map((courseGroup) => (
        <CourseGroupSection
          key={courseGroup.id}
          courseGroup={courseGroup}
        />
      ))}
    </Stack>
  );
};

export default CourseGroupList;
