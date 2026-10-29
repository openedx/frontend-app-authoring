import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import AlertMessage from '@src/generic/alert-message';
import CenteredSpinner from '../CenteredSpinner';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import CourseGroupSection from './CourseGroupSection';
import messages from './messages';
import './criteria-groups.scss';

/** The associations tree for the selected competency: loading, failed, empty, or the
 * accessible course-level groups. A course whose outline returns 403 or 404 is hidden,
 * and any other outline failure shows the error state.
 *
 * The fetch is scoped to the listed courses, so an empty list means one of
 * four things, told apart by the response's counts: the competency has no
 * associations anywhere (`totalCriteriaCount` is 0); none is in a listed course
 * (`criteriaCount` is 0); every one is in a listed course the author cannot
 * open (no association is outside the listed courses); or some are in listed
 * courses the author cannot open and the rest are outside the listed courses.
 * The last two are reachable when the course list includes a course whose
 * outline returns 403. Each gets its own message (#683).
 *
 * While the course list reloads, the previous groups stay on screen and the
 * empty states give way to a spinner: both would describe the previous list.
 */
const CourseGroupList = () => {
  const intl = useIntl();
  const {
    status,
    accessibleCourseGroups,
    criteriaCounts,
    courseList,
    competencyName,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
  } = useCompetencyAssociations();
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const takesKeyboardFocus = keyboardFocusRequest?.kind === 'empty';

  // Reruns when the list length changes, so it takes the request whichever lands first: the request or the empty
  // state it names.
  useEffect(() => {
    if (takesKeyboardFocus && emptyStateRef.current) {
      queueMicrotask(() => emptyStateRef.current?.focus({ preventScroll: true }));
      consumeKeyboardFocusRequest();
    }
  }, [takesKeyboardFocus, accessibleCourseGroups.length, consumeKeyboardFocusRequest]);

  if (status === 'pending') {
    return <CenteredSpinner />;
  }

  if (status === 'error' || !criteriaCounts) {
    return (
      <AlertMessage
        variant="danger"
        description={intl.formatMessage(messages.courseGroupListErrorMessage)}
      />
    );
  }

  if (accessibleCourseGroups.length === 0) {
    if (courseList.isPlaceholderData) {
      return <CenteredSpinner />;
    }
    const name = <strong>{competencyName}</strong>;
    const { criteriaCount, totalCriteriaCount } = criteriaCounts;
    const outOfViewCount = totalCriteriaCount - criteriaCount;
    let firstLine: ReactNode;
    if (totalCriteriaCount === 0) {
      firstLine = intl.formatMessage(messages.noAssociationsMessage, { competencyName: name });
    } else if (criteriaCount === 0) {
      firstLine = intl.formatMessage(messages.noAssociationsInListedCoursesMessage, {
        competencyName: name,
        count: totalCriteriaCount,
      });
    } else if (outOfViewCount === 0) {
      firstLine = intl.formatMessage(messages.noAccessibleAssociationsInListedCoursesMessage, {
        competencyName: name,
        count: criteriaCount,
      });
    } else {
      firstLine = intl.formatMessage(messages.someInaccessibleAssociationsInListedCoursesMessage, {
        competencyName: name,
        inaccessibleCount: criteriaCount,
        outOfViewCount,
      });
    }
    return (
      <div ref={emptyStateRef} tabIndex={-1} className="course-group-list__empty-state">
        <p className="mb-0">{firstLine}</p>
        <p className="mb-0">{intl.formatMessage(messages.noAssociationsPromptMessage)}</p>
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
