import type { ReactNode } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import type { XBlock } from '@src/data/types';
import { LoadingSpinner } from '@src/generic/Loading';
import messages from './messages';
import type { SubsectionSelectedEvent } from './types';

export interface CourseOutlineSubtreeProps {
  courseId: string;
  onSubsectionSelected?: SubsectionSelectedEvent;
}

interface SubsectionRowProps {
  subsection: XBlock;
  isAssociated: boolean;
  onSelect?: SubsectionSelectedEvent;
}

/**
 * One clickable, keyboard-operable row for a single graded subsection.
 *
 * `isAssociated` is a typed seam for a later, separately-scoped ticket that
 * will show a visual "already associated with the active competency" state.
 * `CourseOutlineSubtree` always passes `false` today (no fetch backs it
 * yet), and it is only surfaced as a `data-associated` attribute, so it
 * produces no visible difference right now.
 */
const SubsectionRow = ({ subsection, isAssociated, onSelect }: SubsectionRowProps) => (
  <Button
    variant="tertiary"
    type="button"
    block
    className="course-search-browse__subsection"
    data-associated={isAssociated}
    onClick={() => onSelect?.({ usageKey: subsection.id, blockType: subsection.category })}
  >
    {subsection.displayName}
  </Button>
);

/**
 * Real, lazily-fetched course outline shown inside an expanded `CourseRow`.
 *
 * Renders every section (chapter) as a plain navigation-only header - never
 * clickable, per the ticket's "navigation only, not selectable" rule for
 * sections - and, under each section, only its graded subsections as
 * clickable rows. Ungraded subsections and anything below a subsection
 * (units/verticals) are out of scope and never rendered.
 */
const CourseOutlineSubtree = ({ courseId, onSubsectionSelected }: CourseOutlineSubtreeProps) => {
  const intl = useIntl();
  // `refetchOnMount: false`: this component only ever mounts while its parent
  // `CourseRow` is expanded, so the component's own mount/unmount lifecycle IS
  // the "is this needed" gate - a separate, manually-tracked `enabled` flag on
  // top of that would be redundant. Without this option, collapsing and
  // re-expanding the same course (unmount then remount) within the query
  // cache's normal staleTime would trigger a wasted background refetch of
  // data that's already cached (the query key is unique per course).
  const { data, isLoading, isError } = useCourseOutlineIndex(courseId, { refetchOnMount: false });

  let content: ReactNode;
  if (isLoading) {
    content = <LoadingSpinner size="sm" />;
  } else if (isError) {
    content = (
      <div role="alert" className="text-danger small">
        {intl.formatMessage(messages.outlineErrorMessage)}
      </div>
    );
  } else {
    const sections = (data?.courseStructure.childInfo?.children ?? [])
      .filter((block) => block.category === 'chapter');
    const hasGradedSubsection = sections.some((section) => (
      (section.childInfo?.children ?? []).some(
        (subsection) => subsection.category === 'sequential' && subsection.graded,
      )
    ));

    if (!hasGradedSubsection) {
      content = <div className="small">{intl.formatMessage(messages.noGradedSubsectionsMessage)}</div>;
    } else {
      content = sections.map((section) => {
        const gradedSubsections = (section.childInfo?.children ?? []).filter(
          (subsection) => subsection.category === 'sequential' && subsection.graded,
        );
        return (
          <div key={section.id} className="course-search-browse__group course-search-browse__group--section ml-3">
            <div className="course-search-browse__section-header font-weight-bold small">{section.displayName}</div>
            {gradedSubsections.map((subsection) => (
              <SubsectionRow
                key={subsection.id}
                subsection={subsection}
                isAssociated={false}
                onSelect={onSubsectionSelected}
              />
            ))}
          </div>
        );
      });
    }
  }

  return (
    <div className="course-search-browse__outline ml-4 pl-2 pt-2">
      {content}
    </div>
  );
};

export default CourseOutlineSubtree;
