import { useCallback, useEffect, useRef, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import type { CompetencyTreeNode } from '../CompetencyTree';
import { CompetencyTooltip, useCompetencyTooltip } from '../competency-tooltip';
import { CourseGroupList } from '../criteria-groups';
import messages from './messages';

export interface CriteriaAssociationsSectionProps {
  /** The currently selected competency, named in the "Demonstrate Mastery
   * For" line along with its Competency ID badge.
   */
  competency: CompetencyTreeNode;
}

/** The associations section above "Courses & Content": the selected
 * competency's existing criteria groups, rendered as a tree of course-level
 * groups, bottom-tier groups, and rule boxes.
 *
 * `CourseGroupList` reads its own data and focus state from
 * `CompetencyAssociationsContext`; this component only renders the static
 * label/mastery lines, which need `competency` directly since the context
 * doesn't track its name.
 */
const CriteriaAssociationsSection = ({ competency }: CriteriaAssociationsSectionProps) => {
  const intl = useIntl();

  const headingRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLElement>(null);
  const [isHeadingTruncated, setIsHeadingTruncated] = useState(false);

  const measureHeading = useCallback(
    () => [nameRef.current, badgeRef.current].some((el) => !!el && el.scrollWidth > el.clientWidth),
    [],
  );

  // Catches width changes from dragging the tree/course divider as well as window resizes.
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) { return undefined; }
    setIsHeadingTruncated(measureHeading());
    const resizeObserver = new ResizeObserver(() => setIsHeadingTruncated(measureHeading()));
    resizeObserver.observe(heading);
    return () => resizeObserver.disconnect();
  }, [measureHeading, competency]);

  const tooltip = useCompetencyTooltip(measureHeading);

  return (
    <div className="course-search-browse__associations">
      <div className="course-search-browse__associations-label">
        {intl.formatMessage(messages.associationsSectionLabel)}
      </div>
      <div
        className="course-search-browse__associations-mastery d-flex align-items-center"
        ref={headingRef}
        tabIndex={isHeadingTruncated ? 0 : undefined}
        onMouseEnter={tooltip.openOnHover}
        onMouseLeave={tooltip.close}
        onFocus={tooltip.openOnFocus}
        onBlur={tooltip.close}
      >
        <span className="text-truncate" ref={nameRef}>
          {intl.formatMessage(messages.demonstrateMasteryForLabel, {
            competencyName: <strong>{competency.value}</strong>,
          })}
        </span>
        {competency.externalId && (
          <>
            <span className="sr-only">
              {intl.formatMessage(messages.competencyIdAccessibleLabel, {
                externalId: competency.externalId,
              })}
            </span>
            <Badge
              variant="info"
              className="competency-row__badge text-truncate ml-2"
              aria-hidden="true"
              ref={badgeRef}
            >
              {competency.externalId}
            </Badge>
          </>
        )}
        <CompetencyTooltip
          anchorRef={headingRef}
          name={competency.value}
          externalId={competency.externalId}
          {...tooltip.tooltipProps}
        />
      </div>
      <CourseGroupList />
    </div>
  );
};

export default CriteriaAssociationsSection;
