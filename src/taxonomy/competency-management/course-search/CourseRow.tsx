import { useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import type { Course } from '@src/studio-home/data/api';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import CourseOutlineSubtree from './CourseOutlineSubtree';
import messages from './messages';

export interface CourseRowProps {
  course: Course;
}

/** CourseRow
 * One row of the competency management course search/browse list: a
 * course's title, plus a disclosure control that expands the row to show
 * its outline.
 *
 * The row's title carries no click behavior of its own - only the
 * disclosure control toggles anything, and this row is navigation-only,
 * never an association target for the active competency.
 */
const CourseRow = ({ course }: CourseRowProps) => {
  const intl = useIntl();
  const { notifyCourseExpanded } = useCompetencyAssociations();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLabel = isExpanded
    ? intl.formatMessage(messages.collapseRowButtonLabel)
    : intl.formatMessage(messages.expandRowButtonLabel);

  const handleToggle = () => {
    // Read `isExpanded` directly rather than via the functional-updater
    // form: `handleToggle` is a plain synchronous event handler with
    // `isExpanded` already in scope, so there's no batching/stale-closure
    // reason to use that form here - and React is explicitly allowed to
    // invoke a functional updater more than once, so calling
    // `notifyCourseExpanded` (a different component's state setter) as a
    // side effect from inside one is a real bug, not just a lint nit; it's
    // exactly what triggers React's "Cannot update a component while
    // rendering a different component" warning.
    const next = !isExpanded;
    if (next) {
      // Only on expand, never on collapse - see `notifyCourseExpanded`'s
      // own docstring for why this direction matters.
      notifyCourseExpanded(course.courseKey);
    }
    setIsExpanded(next);
  };

  return (
    <div className="course-search-browse__group course-search-browse__group--course">
      <div className="course-search-browse__course-row d-flex align-items-center">
        <IconButton
          src={isExpanded ? ExpandLess : ExpandMore}
          alt={toggleLabel}
          aria-label={toggleLabel}
          aria-expanded={isExpanded}
          size="sm"
          onClick={handleToggle}
        />
        <div className="course-search-browse__course-title ml-2">{course.displayName}</div>
      </div>
      {isExpanded && <CourseOutlineSubtree courseId={course.courseKey} />}
    </div>
  );
};

export default CourseRow;
