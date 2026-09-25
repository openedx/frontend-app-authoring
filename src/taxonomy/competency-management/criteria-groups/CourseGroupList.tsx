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
 * groups. Reads everything - the two data queries, the built index, and the
 * focus state each `CourseGroupSection` needs - from
 * `CompetencyAssociationsContext`.
 *
 * "Loading" covers both the groups query and the default-rule-profile
 * query - `effectiveRuleOf` needs the profile to resolve any criterion
 * that carries no override of its own, so content can't render correctly
 * until both have resolved. The empty state is decided on
 * `accessibleCourseGroups` (the context's own already-filtered list - see
 * its own docstring), never the raw `#681` payload's own counts, so "every
 * association is in a course this author can't see" renders identically to
 * "no associations at all" - and a failed load never renders as either.
 */
const CourseGroupList = () => {
  const intl = useIntl();
  const { groupsQuery, profileQuery, index, accessibleCourseGroups } = useCompetencyAssociations();

  if (groupsQuery.isLoading || profileQuery.isLoading) {
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
