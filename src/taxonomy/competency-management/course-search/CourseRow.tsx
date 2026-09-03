import { useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import type { Course } from '@src/studio-home/data/api';
import messages from './messages';

export interface CourseRowProps {
  course: Course;
}

/** CourseRow
 * One row of the competency management course search/browse list: a
 * course's title and org/number/run subtitle, plus a disclosure control that
 * expands the row to show its outline.
 *
 * The row's title/subtitle carry no click behavior of their own - only the
 * disclosure control toggles anything, and this row is navigation-only,
 * never an association target for the active competency.
 */
const CourseRow = ({ course }: CourseRowProps) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLabel = isExpanded
    ? intl.formatMessage(messages.collapseRowButtonLabel)
    : intl.formatMessage(messages.expandRowButtonLabel);

  return (
    <div className="border-bottom py-2">
      <div className="d-flex align-items-center">
        <IconButton
          src={isExpanded ? ExpandLess : ExpandMore}
          alt={toggleLabel}
          aria-label={toggleLabel}
          aria-expanded={isExpanded}
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
        />
        <div className="ml-2">
          <div>{course.displayName}</div>
          <div className="text-gray-500 small">
            {course.org} / {course.number} / {course.run}
          </div>
        </div>
      </div>
      {isExpanded && (
        // Seam for step 5 (CourseOutlineSubtree), which replaces this static
        // placeholder with a real outline fetch; that fetch is out of scope here.
        <div className="ml-4 pl-2 pt-2">
          {intl.formatMessage(messages.outlinePlaceholder)}
        </div>
      )}
    </div>
  );
};

export default CourseRow;
