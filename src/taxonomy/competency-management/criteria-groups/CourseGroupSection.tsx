import { Fragment, useEffect, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, IconButton, Stack } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import classNames from 'classnames';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import { courseKeyOfFocus } from '../criterionTarget';
import type { CourseCompetencyCriteriaGroup } from '../data/types';
import { bottomTierGroupsForCourse } from '../utils';
import AddControl from './AddControl';
import type { AddControlProps } from './AddControl';
import CriteriaGroupBox from './CriteriaGroupBox';
import GroupConnector from './GroupConnector';
import messages from './messages';

export interface CourseGroupSectionProps {
  courseGroup: CourseCompetencyCriteriaGroup;
}

/** One accessible course-level group: its own header ("From within
 * **{course name}** ...") and its bottom-tier group cards, with an Or/And connector
 * between each adjacent pair. Renders nothing until the course outline has loaded.
 */
const CourseGroupSection = ({ courseGroup }: CourseGroupSectionProps) => {
  const intl = useIntl();
  const {
    canEditCourse,
    expansionCountByCourseId,
    focus,
    groupsIndex,
    status,
    placeholder,
    addPlaceholderGroup,
    discardPlaceholder,
    hasPlaceholder,
    isAssociating,
  } = useCompetencyAssociations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data } = useCourseOutlineIndex(courseGroup.courseKey, { refetchOnMount: false });

  const subsectionNamesByUsageKey = useMemo(() => {
    const names: Record<string, string> = {};
    (data?.courseStructure.childInfo?.children ?? []).forEach((section) => {
      (section.childInfo?.children ?? []).forEach((subsection) => {
        names[subsection.id] = subsection.displayName;
      });
    });
    return names;
  }, [data]);

  // A placeholder group (`focus.groupId === null`) is shown as one more card after the real ones.
  const showPlaceholderGroup = focus?.groupId === null && placeholder.parentRuleGroupId === courseGroup.id;
  const containsFocus = status === 'success' &&
    courseKeyOfFocus(focus, placeholder, groupsIndex) === courseGroup.courseKey;
  const holdsPlaceholderRuleBox = focus?.ruleKey === null
    && focus.groupId !== null
    && groupsIndex?.groupsById.get(focus.groupId)?.parentId === courseGroup.id;

  const handleToggleCollapsed = () => {
    // A collapsed section hides its placeholder, so it is dropped instead of lingering unseen.
    if (!isCollapsed && (showPlaceholderGroup || holdsPlaceholderRuleBox)) {
      discardPlaceholder();
    }
    setIsCollapsed((prev) => !prev);
  };

  const expansionCount = expansionCountByCourseId[courseGroup.courseKey] ?? 0;

  // A collapsed card reopens when the focus moves into it or its course is expanded, so the focused box is visible.
  useEffect(() => {
    if (containsFocus) {
      setIsCollapsed(false);
    }
  }, [focus, containsFocus, expansionCount]);

  if (status !== 'success' || !data) {
    return null;
  }

  const courseName = data.courseStructure.displayName;
  const canEdit = canEditCourse(courseGroup.courseKey);
  const bottomTierGroups = bottomTierGroupsForCourse(groupsIndex, courseGroup.courseKey);
  const toggleLabel = intl.formatMessage(
    isCollapsed ? messages.expandCourseGroupButtonLabel : messages.collapseCourseGroupButtonLabel,
    { courseName },
  );

  let disabledReason: AddControlProps['disabledReason'] = null;
  if (isAssociating) {
    disabledReason = 'saving';
  } else if (hasPlaceholder) {
    disabledReason = 'placeholder';
  }

  return (
    <Card className={classNames('course-group-section', { 'course-group-section--focused': containsFocus })}>
      <Card.Header
        size="sm"
        title={
          <Stack direction="horizontal" gap={1} className="course-group-section__title">
            <IconButton
              src={isCollapsed ? ExpandMore : ExpandLess}
              alt={toggleLabel}
              aria-label={toggleLabel}
              aria-expanded={!isCollapsed}
              size="inline"
              onClick={handleToggleCollapsed}
            />
            <h3 className="course-group-section__heading">
              {intl.formatMessage(messages.fromWithinCourseLabel, {
                courseName: <span key="course-name" className="font-weight-bold">{courseName}</span>,
              })}
            </h3>
          </Stack>
        }
      />
      {!isCollapsed && (
        <Card.Body className="course-group-section__body">
          <Stack gap={2}>
            {bottomTierGroups.map((group, groupIndex) => (
              <Fragment key={group.id}>
                {groupIndex > 0 && <GroupConnector logicOperator={courseGroup.logicOperator} />}
                <CriteriaGroupBox
                  group={group}
                  subsectionNamesByUsageKey={subsectionNamesByUsageKey}
                  canEdit={canEdit}
                />
              </Fragment>
            ))}
            {showPlaceholderGroup && (
              <Fragment key="placeholder">
                {bottomTierGroups.length > 0 && <GroupConnector logicOperator={courseGroup.logicOperator} />}
                <CriteriaGroupBox subsectionNamesByUsageKey={subsectionNamesByUsageKey} canEdit={canEdit} />
              </Fragment>
            )}
            {canEdit && (
              <AddControl
                label={intl.formatMessage(messages.addRuleGroupButtonLabel)}
                accessibleLabel={intl.formatMessage(messages.addRuleGroupAccessibleLabel)}
                disabledReason={disabledReason}
                onClick={() => addPlaceholderGroup(courseGroup.id)}
              />
            )}
          </Stack>
        </Card.Body>
      )}
    </Card>
  );
};

export default CourseGroupSection;
