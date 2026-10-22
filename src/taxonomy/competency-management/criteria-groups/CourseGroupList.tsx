import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '@src/generic/alert-message';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import courseSearchMessages from '../course-search/messages';
import CourseGroupSection from './CourseGroupSection';
import messages from './messages';
// @ts-ignore
import './criteria-groups.scss';

/** The top-of-panel associations tree for the currently selected
 * competency: loading, failed, empty, or the list of accessible course-level
 * groups. Reads everything from `CompetencyAssociationsContext`.
 *
 * "Loading" covers the groups, default-rule-profile, and per-course outline
 * queries. The empty state is decided on `accessibleCourseGroups`, never the
 * raw payload, so a course the author can't see renders as no associations.
 */
const CourseGroupList = () => {
  const intl = useIntl();
  const {
    groupsQuery,
    profileQuery,
    index,
    accessibleCourseGroups,
    areCourseOutlinesLoading,
  } = useCompetencyAssociations();

  if (groupsQuery.isLoading || profileQuery.isLoading || areCourseOutlinesLoading) {
    return (
      <div className="d-flex justify-content-center py-3">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (groupsQuery.isError || profileQuery.isError || !index || !profileQuery.data) {
    return (
      <AlertMessage
        variant="danger"
        description={intl.formatMessage(messages.courseGroupListErrorMessage)}
      />
    );
  }

  if (accessibleCourseGroups.length === 0) {
    return (
      <div className="course-search-browse__associations-empty-state">
        <p>{intl.formatMessage(courseSearchMessages.noAssociationsMessage)}</p>
        <p>{intl.formatMessage(courseSearchMessages.noAssociationsPromptMessage)}</p>
      </div>
    );
  }

  return (
    <div className="course-group-list">
      {accessibleCourseGroups.map((courseGroup) => (
        <CourseGroupSection
          key={courseGroup.id}
          courseGroup={courseGroup}
        />
      ))}
    </div>
  );
};

export default CourseGroupList;
