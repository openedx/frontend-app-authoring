import {
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Icon,
  IconButton,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  AddCircle,
  Cancel,
  ExpandLess,
  ExpandMore,
} from '@openedx/paragon/icons';

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
  /** True while an association is created or a group or criterion is deleted; the pill is disabled meanwhile. */
  isBusy: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
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
  buttonRef,
  onAssociate,
  children,
}: AddSubsectionPillProps) => {
  const intl = useIntl();
  const tooltipId = useId();
  const descriptionId = useId();
  const [show, setShow] = useState(false);
  const isBlocked = conflictingCompetency !== undefined;
  const isTooltipOpen = isBlocked && show;
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
          ref={buttonRef}
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
 * One graded subsection: its name plus the competency pill. The applied pill shows regardless of
 * `canEditCourse`, and holds a remove button when the author can edit, including in a blocked course.
 * Takes keyboard focus back after a remove started from this row.
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
    groupsIndex,
    isDeletingGroupOrCriterion,
    removeCriterion,
    keyboardFocusRequest,
    consumeKeyboardFocusRequest,
    status,
  } = useCompetencyAssociations();
  // The `course_index` response populates `.id`, never `.usageKey`.
  const isAssociated = associatedObjectIds.has(subsection.id);
  const canAssociate = status === 'success' && canEditCourse(courseId);

  // An unassociated row holds the associate button and an associated one the remove button, so whichever is
  // mounted takes a focus request.
  const associateButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  const isPillButtonDisabled = isDeletingGroupOrCriterion || isAssociating;
  // Waits for the button to be enabled again, since a disabled button cannot take focus.
  const takesKeyboardFocus = keyboardFocusRequest?.kind === 'subsection'
    && keyboardFocusRequest.objectId === subsection.id
    && !isPillButtonDisabled;
  useEffect(() => {
    const target = isAssociated ? removeButtonRef.current : associateButtonRef.current;
    if (takesKeyboardFocus && target) {
      target.focus();
      consumeKeyboardFocusRequest();
    }
  }, [takesKeyboardFocus, consumeKeyboardFocusRequest, isAssociated, canAssociate]);

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
        {canAssociate && (
          <>
            <span className="course-search-browse__subsection-pill-divider" aria-hidden="true" />
            <IconButton
              ref={removeButtonRef}
              src={Cancel}
              size="inline"
              invertColors
              alt={intl.formatMessage(rootMessages.removeCriterionButtonLabel, {
                subsectionName: subsection.displayName,
              })}
              disabled={isPillButtonDisabled}
              onClick={() => {
                const criterion = [...(groupsIndex?.criteriaByGroupId.values() ?? [])].flat()
                  .find((candidate) => candidate.objectId === subsection.id);
                if (criterion) {
                  removeCriterion(criterion.id, 'subsection');
                }
              }}
            />
          </>
        )}
      </span>
    );
  } else if (canAssociate) {
    pill = (
      <AddSubsectionPill
        buttonRef={associateButtonRef}
        subsectionName={subsection.displayName}
        competencyExternalId={competencyExternalId}
        conflictingCompetency={conflictingCompetencyName(courseId)}
        isBusy={isPillButtonDisabled}
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
