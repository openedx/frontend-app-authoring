import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import classNames from 'classnames';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import { useCompetencyAssociations } from '@src/taxonomy/competency-management/CompetencyAssociationsContext';
import { RemovalTargetKind } from '@src/taxonomy/competency-management/constants';
import { courseKeyOfSelection } from '@src/taxonomy/competency-management/criterionTarget';
import type { CourseCompetencyCriteriaGroup } from '@src/taxonomy/competency-management/data/types';
import { bottomTierGroupsForCourse, subsectionNamesFromOutline } from '@src/taxonomy/competency-management/utils';
import AddControl from './AddControl';
import type { AddControlProps } from './AddControl';
import CriteriaGroupBox from './CriteriaGroupBox';
import GroupConnector from './GroupConnector';
import MoreActionsMenu from './MoreActionsMenu';
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
    selection,
    groupsIndex,
    status,
    placeholder,
    addPlaceholderGroup,
    discardPlaceholder,
    hasPlaceholder,
    isAssociating,
    courseList,
    competencyName,
    requestRemoval,
    isDeletingGroupOrRuleBoxOrCriterion,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
  } = useCompetencyAssociations();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sectionToggleRef = useRef<HTMLButtonElement>(null);
  const { data } = useCourseOutlineIndex(courseGroup.courseKey, { refetchOnMount: false });

  const subsectionNamesByUsageKey = useMemo(
    () => (data ? subsectionNamesFromOutline(data.courseStructure) : {}),
    [data],
  );

  // A placeholder group (`selection.groupId === null`) is shown as one more card after the real ones.
  const showPlaceholderGroup = selection?.groupId === null && placeholder.parentRuleGroupId === courseGroup.id;
  const containsSelection = status === 'success' &&
    courseKeyOfSelection(selection, placeholder, groupsIndex) === courseGroup.courseKey;
  const holdsPlaceholderRuleBox = selection?.ruleKey === null
    && selection.groupId !== null
    && groupsIndex?.groupsById.get(selection.groupId)?.parentId === courseGroup.id;

  const bottomTierGroups = status === 'success' ? bottomTierGroupsForCourse(groupsIndex, courseGroup.courseKey) : [];

  // A collapsed section has not mounted its cards. When the request moves selection into the section, the selection
  // effect below expands it. When the request keeps the author's collapse, the section stays collapsed and focus goes
  // to its expand toggle.
  const request = keyboardFocusRequest?.kind === 'group'
      && bottomTierGroups.some((group) => group.id === keyboardFocusRequest.groupId)
    ? keyboardFocusRequest
    : null;
  const holdsFocusRequestTarget = request !== null;
  const requestMovesSelection = request !== null && request.selectionMoved;
  useEffect(() => {
    if (holdsFocusRequestTarget && isCollapsed && !requestMovesSelection) {
      // The dialog's own focus return runs in a microtask when it unmounts, so this one is queued to land after it.
      queueMicrotask(() => sectionToggleRef.current?.focus());
      consumeKeyboardFocusRequest();
    }
  }, [holdsFocusRequestTarget, requestMovesSelection, isCollapsed, consumeKeyboardFocusRequest]);

  const isMenuDisabled = isDeletingGroupOrRuleBoxOrCriterion || isAssociating;
  const canEdit = canEditCourse(courseGroup.courseKey);

  const handleToggleCollapsed = () => {
    // A collapsed section hides its placeholder, so it is dropped instead of lingering unseen.
    if (!isCollapsed && (showPlaceholderGroup || holdsPlaceholderRuleBox)) {
      discardPlaceholder();
    }
    setIsCollapsed((prev) => !prev);
  };

  const expansionCount = expansionCountByCourseId[courseGroup.courseKey] ?? 0;

  // A collapsed card reopens when the selection moves into it or its course is expanded, so the selected box is visible.
  useEffect(() => {
    if (containsSelection) {
      setIsCollapsed(false);
    }
  }, [selection, containsSelection, expansionCount]);

  if (status !== 'success' || !data) {
    return null;
  }

  const courseName = data.courseStructure.displayName;
  const toggleLabel = intl.formatMessage(
    isCollapsed ? messages.expandCourseGroupButtonLabel : messages.collapseCourseGroupButtonLabel,
    { courseName },
  );

  let disabledReason: AddControlProps['disabledReason'] = null;
  if (isAssociating) {
    disabledReason = 'saving';
  } else if (courseList.isPlaceholderData) {
    // A reload can list other courses, which would discard an unsaved box started now.
    disabledReason = 'loading';
  } else if (isDeletingGroupOrRuleBoxOrCriterion) {
    disabledReason = 'deleting';
  } else if (hasPlaceholder) {
    disabledReason = 'placeholder';
  }

  return (
    <Card className={classNames('course-group-section', { 'course-group-section--selected': containsSelection })}>
      <Card.Header
        size="sm"
        title={
          <Stack direction="horizontal" gap={1} className="course-group-section__title">
            <IconButton
              ref={sectionToggleRef}
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
        actions={canEdit && (
          <MoreActionsMenu
            id={`course-group-menu-toggle-${courseGroup.id}`}
            toggleLabel={intl.formatMessage(messages.courseGroupMoreActionsLabel, { courseName })}
            removeLabel={intl.formatMessage(messages.removeFromCompetencyMenuItem, { competencyName })}
            disabled={isMenuDisabled}
            onRemove={() => requestRemoval({ kind: RemovalTargetKind.CourseGroup, groupId: courseGroup.id })}
          />
        )}
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
                  position={groupIndex + 1}
                  courseName={courseName}
                />
              </Fragment>
            ))}
            {showPlaceholderGroup && (
              <Fragment key="placeholder">
                {bottomTierGroups.length > 0 && <GroupConnector logicOperator={courseGroup.logicOperator} />}
                <CriteriaGroupBox
                  subsectionNamesByUsageKey={subsectionNamesByUsageKey}
                  canEdit={canEdit}
                  position={bottomTierGroups.length + 1}
                  courseName={courseName}
                />
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
