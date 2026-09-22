import { type ReactNode, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import type { XBlock } from '@src/data/types';
import { LoadingSpinner } from '@src/generic/Loading';
import messages from './messages';

export interface CourseOutlineSubtreeProps {
  courseId: string;
}

interface SubsectionRowProps {
  subsection: XBlock;
  isAssociated: boolean;
}

/**
 * One row for a single graded subsection.
 *
 * `isAssociated` is a typed seam for a later, separately-scoped ticket that
 * will show a visual "already associated with the active competency" state.
 * `CourseOutlineSubtree` always passes `false` today (no fetch backs it
 * yet), and it is only surfaced as a `data-associated` attribute, so it
 * produces no visible difference right now.
 */
const SubsectionRow = ({ subsection, isAssociated }: SubsectionRowProps) => (
  <Button
    variant="tertiary"
    type="button"
    block
    className="course-search-browse__subsection"
    data-associated={isAssociated}
  >
    {subsection.displayName}
  </Button>
);

interface SectionHeaderProps {
  displayName: string;
  hasGradedSubsection: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * One section (chapter) header, never itself an association target for the
 * active competency (navigation only, mirroring `CourseRow`'s own course
 * title).
 *
 * A section with at least one graded subsection gets its own disclosure
 * control - reusing the plain `IconButton` + `ExpandLess`/`ExpandMore`
 * pattern `CourseRow` already uses for its course-level toggle - and starts
 * collapsed. A section with no graded subsections has nothing to disclose,
 * so it keeps rendering as plain, non-interactive text with no icon.
 */
const SectionHeader = ({
  displayName,
  hasGradedSubsection,
  isExpanded,
  onToggle,
}: SectionHeaderProps) => {
  const intl = useIntl();

  if (!hasGradedSubsection) {
    return <div className="course-search-browse__section-header font-weight-bold small">{displayName}</div>;
  }

  const toggleLabel = isExpanded
    ? intl.formatMessage(messages.collapseSectionButtonLabel)
    : intl.formatMessage(messages.expandSectionButtonLabel);

  return (
    <div className="course-search-browse__section-header font-weight-bold small d-flex align-items-center">
      <IconButton
        src={isExpanded ? ExpandLess : ExpandMore}
        alt={toggleLabel}
        aria-label={toggleLabel}
        aria-expanded={isExpanded}
        size="sm"
        onClick={onToggle}
      />
      <div className="ml-2">{displayName}</div>
    </div>
  );
};

/**
 * Real, lazily-fetched course outline shown inside an expanded `CourseRow`.
 *
 * Renders every section (chapter) as a header, and under each section, only
 * its graded subsections as clickable rows - ungraded subsections and
 * anything below a subsection (units/verticals) are out of scope and never
 * rendered. A section with at least one graded subsection gets its own
 * disclosure control (see `SectionHeader`), defaulting to collapsed; a
 * section with none keeps its header non-interactive, same as before.
 */
const CourseOutlineSubtree = ({ courseId }: CourseOutlineSubtreeProps) => {
  const intl = useIntl();
  // `refetchOnMount: false`: this component only ever mounts while its parent
  // `CourseRow` is expanded, so the component's own mount/unmount lifecycle IS
  // the "is this needed" gate - a separate, manually-tracked `enabled` flag on
  // top of that would be redundant. Without this option, collapsing and
  // re-expanding the same course (unmount then remount) within the query
  // cache's normal staleTime would trigger a wasted background refetch of
  // data that's already cached (the query key is unique per course).
  const { data, isLoading, isError } = useCourseOutlineIndex(courseId, { refetchOnMount: false });
  // Ids of sections (chapters) currently expanded, showing their graded
  // subsections - every section starts collapsed, mirroring `CourseRow`'s own
  // default-collapsed convention for its course-level toggle.
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());

  const handleToggleSection = (sectionId: string) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

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
    // Computed once per section (rather than filtered separately for
    // `hasGradedSubsection` and for rendering) so both uses stay in sync.
    const sectionsWithGradedSubsections = (data?.courseStructure.childInfo?.children ?? [])
      .filter((block) => block.category === 'chapter')
      .map((section) => ({
        section,
        gradedSubsections: (section.childInfo?.children ?? []).filter(
          (subsection) => subsection.category === 'sequential' && subsection.graded,
        ),
      }));
    const hasGradedSubsection = sectionsWithGradedSubsections.some(
      ({ gradedSubsections }) => gradedSubsections.length > 0,
    );

    if (!hasGradedSubsection) {
      content = <div className="small">{intl.formatMessage(messages.noGradedSubsectionsMessage)}</div>;
    } else {
      content = sectionsWithGradedSubsections.map(({ section, gradedSubsections }) => {
        const sectionId = String(section.id);
        const sectionHasGradedSubsection = gradedSubsections.length > 0;
        const isExpanded = expandedSectionIds.has(sectionId);

        return (
          <div key={section.id} className="course-search-browse__group course-search-browse__group--section">
            <SectionHeader
              displayName={section.displayName}
              hasGradedSubsection={sectionHasGradedSubsection}
              isExpanded={isExpanded}
              onToggle={() => handleToggleSection(sectionId)}
            />
            {sectionHasGradedSubsection && isExpanded && gradedSubsections.map((subsection) => (
              <SubsectionRow
                key={subsection.id}
                subsection={subsection}
                isAssociated={false}
              />
            ))}
          </div>
        );
      });
    }
  }

  return (
    <div className="course-search-browse__outline pt-2">
      {content}
    </div>
  );
};

export default CourseOutlineSubtree;
