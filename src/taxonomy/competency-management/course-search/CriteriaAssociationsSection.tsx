import { useCallback, useEffect, useRef, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import type { CompetencyTreeNode } from '../CompetencyTree';
import { CompetencyTooltip, useCompetencyTooltip } from '../competency-tooltip';
import { CourseGroupList } from '../criteria-groups';
import rootMessages from '../messages';
import messages from './messages';

export interface CriteriaAssociationsSectionProps {
  competency: CompetencyTreeNode;
}

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
            competencyName: <span className="font-weight-bold">{competency.value}</span>,
          })}
        </span>
        {competency.externalId && (
          <>
            <span className="sr-only">
              {intl.formatMessage(rootMessages.competencyIdAccessibleLabel, {
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
