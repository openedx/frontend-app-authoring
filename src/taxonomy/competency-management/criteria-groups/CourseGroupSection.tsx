import { Fragment, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CourseCompetencyCriteriaGroup } from '../data/types';
import { bottomTierGroupsForCourse } from '../utils';
import CriteriaGroupBox from './CriteriaGroupBox';
import GroupConnector from './GroupConnector';
import messages from './messages';

export interface CourseGroupSectionProps {
  courseGroup: CourseCompetencyCriteriaGroup;
}

/** One accessible course-level group: its own header ("From within
 * **{course name}** ...") and its bottom-tier group cards, connected
 * pairwise by `GroupConnector`.
 *
 * `CourseGroupList` only ever mounts this for a course-level group already
 * confirmed accessible - `CompetencyAssociationsContext`'s own
 * `accessibleCourseGroups` only includes a course whose outline fetch has
 * already resolved successfully (see that context's own docstring and
 * `utils.ts`'s `visibleCourseGroups`), which is exactly this ticket's own
 * "a course-level group for a course I cannot see is not shown" acceptance
 * criterion. So by the time this mounts, its own `useCourseOutlineIndex`
 * call below - the same hook and query key `CourseOutlineSubtree` already
 * uses when a course is expanded, so an already-expanded (or
 * later-expanded) course costs no extra request and never disagrees about
 * a name - is reading an already-resolved, already-cached success; the
 * `isError`/raw-course-key fallback below is defensive only (e.g. a cache
 * eviction between the visibility check and this render), not a real
 * user-facing "inaccessible course" state - that state is never rendered
 * at all, not even with this fallback.
 */
const CourseGroupSection = ({ courseGroup }: CourseGroupSectionProps) => {
  const intl = useIntl();
  const { index } = useCompetencyAssociations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // `refetchOnMount: false`: mirrors `CourseOutlineSubtree`'s own reasoning -
  // this section's mount/unmount lifecycle already gates whether the data
  // is needed, so a background refetch of already-cached data on every
  // mount would be wasted.
  const { data, isError } = useCourseOutlineIndex(courseGroup.courseKey, { refetchOnMount: false });

  const courseDisplayName = (!isError && data) ? data.courseStructure.displayName : courseGroup.courseKey;

  const subsectionNamesByUsageKey = useMemo(() => {
    const names: Record<string, string> = {};
    if (!isError && data) {
      (data.courseStructure.childInfo?.children ?? []).forEach((section) => {
        (section.childInfo?.children ?? []).forEach((subsection) => {
          // `subsection.id` - not `.usageKey` - is the field the real
          // `course_index` response actually populates with the
          // usage-key-formatted string; see `CourseOutlineSubtree`'s own
          // `SubsectionRow` for the same fix and the fuller explanation.
          names[subsection.id] = subsection.displayName;
        });
      });
    }
    return names;
  }, [data, isError]);

  // `index` is only `undefined` while `CourseGroupList`'s own loading/error
  // states are showing - it never renders this component until the groups
  // query has resolved.
  const bottomTierGroups = index ? bottomTierGroupsForCourse(index, courseGroup.courseKey) : [];

  const toggleLabel = isCollapsed
    ? intl.formatMessage(messages.expandCourseGroupButtonLabel)
    : intl.formatMessage(messages.collapseCourseGroupButtonLabel);

  return (
    <Card className="course-group-section">
      <Card.Header
        size="sm"
        title={intl.formatMessage(messages.fromWithinCourseLabel, {
          courseName: <strong key="course-name">{courseDisplayName}</strong>,
        })}
        actions={
          <IconButton
            src={isCollapsed ? ExpandMore : ExpandLess}
            alt={toggleLabel}
            aria-label={toggleLabel}
            aria-expanded={!isCollapsed}
            size="sm"
            onClick={() => setIsCollapsed((prev) => !prev)}
          />
        }
      />
      {!isCollapsed && (
        <Card.Body className="course-group-section__body">
          {bottomTierGroups.map((group, groupIndex) => (
            <Fragment key={group.id}>
              {groupIndex > 0 && <GroupConnector logicOperator={courseGroup.logicOperator} />}
              <CriteriaGroupBox
                group={group}
                subsectionNamesByUsageKey={subsectionNamesByUsageKey}
              />
            </Fragment>
          ))}
        </Card.Body>
      )}
    </Card>
  );
};

export default CourseGroupSection;
