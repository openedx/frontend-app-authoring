import { type ReactNode, useEffect, useId, useState } from 'react';

import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Icon,
  IconButton,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { AddCircle, ExpandLess, ExpandMore } from '@openedx/paragon/icons';

import { useCourseOutlineIndex } from '@src/course-outline/data';
import type { XBlock } from '@src/data/types';
import CompetencyIcon from '@src/generic/CompetencyIcon';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCompetencyAssociations } from '../CompetencyAssociationsContext';
import rootMessages from '../messages';
import messages from './messages';

export interface CourseOutlineSubtreeProps {
  courseId: string;
}

interface AddSubsectionPillProps {
  subsectionName: string;
  competencyExternalId: string | null;
  /** The name of the competency that blocks this course, or `undefined` when nothing does. */
  conflictingCompetency: string | undefined;
  /** True while an association is created or a group is deleted; the pill is disabled meanwhile. */
  isBusy: boolean;
  onAssociate: () => void;
  /** The pill's icon and external ID, shared with the applied pill. */
  children: ReactNode;
}

/**
 * The pill that associates a subsection with the competency being edited. In a blocked course the
 * same button stays, so keyboard focus survives the lookup's answer arriving. It keeps
 * `aria-disabled` instead of `disabled`, so it stays focusable and the tooltip opens on focus as
 * well as hover.
 */
const AddSubsectionPill = ({
  subsectionName,
  competencyExternalId,
  conflictingCompetency,
  isBusy,
  onAssociate,
  children,
}: AddSubsectionPillProps) => {
  const intl = useIntl();
  const tooltipId = useId();
  const descriptionId = useId();
  const [show, setShow] = useState(false);
  const isBlocked = conflictingCompetency !== undefined;
  const isTooltipOpen = isBlocked && show;
  // Lets Escape dismiss the tooltip without moving focus (WCAG 1.4.13). Listening on `document` covers a
  // tooltip opened by hover while focus is elsewhere, and the capture phase keeps the listener working when
  // focus is inside an element that stops the key press.
  useEffect(() => {
    if (!isTooltipOpen) { return undefined; }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setShow(false); }
    };
    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [isTooltipOpen]);
  const tooltipText = isBlocked
    ? intl.formatMessage(messages.hierarchyConflictTooltip, { competencyName: conflictingCompetency })
    : '';
  let describedBy: string | undefined;
  // While the tooltip is open the popper appends its id with a comma, which breaks an id list,
  // so the button points at the tooltip alone, which carries the same text.
  if (isBlocked) {
    describedBy = isTooltipOpen ? tooltipId : descriptionId;
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        trigger={['hover', 'focus']}
        show={isTooltipOpen}
        onToggle={setShow}
        overlay={
          <Tooltip id={tooltipId} variant="light" className="course-search-browse-blocked-tooltip">
            {tooltipText}
          </Tooltip>
        }
      >
        <Button
          variant="tertiary"
          type="button"
          className={classNames(
            'course-search-browse__subsection-pill course-search-browse__subsection-pill--available',
            { 'course-search-browse__subsection-pill--blocked': isBlocked },
          )}
          aria-label={competencyExternalId
            ? intl.formatMessage(messages.associateSubsectionButtonLabel, {
              externalId: competencyExternalId,
              subsectionName,
            })
            : intl.formatMessage(messages.associateSubsectionWithoutIdButtonLabel, { subsectionName })}
          aria-disabled={isBlocked}
          aria-describedby={describedBy}
          disabled={isBlocked ? undefined : isBusy}
          onClick={isBlocked ? undefined : onAssociate}
        >
          {children}
          {!isBlocked && (
            <>
              <span className="course-search-browse__subsection-pill-divider" aria-hidden="true" />
              <Icon src={AddCircle} size="xs" aria-hidden="true" />
            </>
          )}
        </Button>
      </OverlayTrigger>
      <span id={descriptionId} className="sr-only">{tooltipText}</span>
    </>
  );
};

interface SubsectionRowProps {
  subsection: XBlock;
  courseId: string;
}

/**
 * One graded subsection: its name plus the competency pill. The applied pill
 * shows regardless of `canEditCourse`.
 *
 * A course is blocked for the competency being edited when one of its ancestors or descendants
 * already has associations there. A blocked row's associate button is disabled, grey, and has a
 * tooltip naming that competency.
 */
const SubsectionRow = ({ subsection, courseId }: SubsectionRowProps) => {
  const intl = useIntl();
  const {
    associatedObjectIds,
    associateSubsection,
    canEditCourse,
    competencyExternalId,
    conflictingCompetencyName,
    isAssociating,
    isDeletingGroup,
    status,
  } = useCompetencyAssociations();
  // The `course_index` response populates `.id`, never `.usageKey`.
  const isAssociated = associatedObjectIds.has(subsection.id);
  const canAssociate = status === 'success' && canEditCourse(courseId);

  const pillContent = (
    <>
      <CompetencyIcon aria-hidden="true" />
      {competencyExternalId && (
        <span className="course-search-browse__subsection-pill-id" aria-hidden="true">
          {competencyExternalId}
        </span>
      )}
    </>
  );

  let pill: ReactNode = null;
  if (isAssociated) {
    pill = (
      <span className="course-search-browse__subsection-pill course-search-browse__subsection-pill--applied">
        <span className="sr-only">{intl.formatMessage(messages.subsectionAssociatedLabel)}</span>
        {competencyExternalId && (
          <span className="sr-only">
            {intl.formatMessage(rootMessages.competencyIdAccessibleLabel, { externalId: competencyExternalId })}
          </span>
        )}
        {pillContent}
      </span>
    );
  } else if (canAssociate) {
    pill = (
      <AddSubsectionPill
        subsectionName={subsection.displayName}
        competencyExternalId={competencyExternalId}
        conflictingCompetency={conflictingCompetencyName(courseId)}
        isBusy={isAssociating || isDeletingGroup}
        onAssociate={() => associateSubsection(subsection.id, courseId)}
      >
        {pillContent}
      </AddSubsectionPill>
    );
  }

  return (
    <div className="course-search-browse__subsection d-flex align-items-center justify-content-between">
      <span>{subsection.displayName}</span>
      {pill}
    </div>
  );
};

const PermissionsError = () => {
  const intl = useIntl();
  const { hasPermissionsError } = useCompetencyAssociations();
  if (!hasPermissionsError) {
    return null;
  }
  return (
    <div role="alert" className="text-danger small">
      {intl.formatMessage(messages.permissionsErrorMessage)}
    </div>
  );
};

interface SectionHeaderProps {
  displayName: string;
  hasGradedSubsection: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * One section (chapter) header: navigation only, never an association
 * target. A section with a graded subsection gets its own disclosure
 * control, starting collapsed; a section with none renders as plain,
 * non-interactive text with no icon.
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
      <div className="course-search-browse__section-title ml-2">{displayName}</div>
    </div>
  );
};

/**
 * Lazily-fetched course outline shown inside an expanded `CourseRow`.
 *
 * Renders each section as a header, and under it only its graded
 * subsections as rows; ungraded subsections and anything below a
 * subsection (units/verticals) are never rendered.
 */
const CourseOutlineSubtree = ({ courseId }: CourseOutlineSubtreeProps) => {
  const intl = useIntl();
  // Re-expanding a course should not refetch an outline already loaded, even once stale or invalidated.
  const { data, isLoading, isError } = useCourseOutlineIndex(courseId, { refetchOnMount: false });
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
      const sectionRows = sectionsWithGradedSubsections.map(({ section, gradedSubsections }) => {
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
                courseId={courseId}
              />
            ))}
          </div>
        );
      });
      content = (
        <>
          <PermissionsError />
          {sectionRows}
        </>
      );
    }
  }

  return (
    <div className="course-search-browse__outline pt-2">
      {content}
    </div>
  );
};

export default CourseOutlineSubtree;
