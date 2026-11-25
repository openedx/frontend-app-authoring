import { useId, type RefObject } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Overlay, Tooltip } from '@openedx/paragon';

import messages from '@src/taxonomy/competency-management/messages';
import './CompetencyTooltip.scss';

export interface CompetencyTooltipProps {
  anchorRef: RefObject<HTMLElement>;
  show: boolean;
  name: string;
  externalId?: string | null;
  onHide: () => void;
}

/**
 * Full name and Competency ID of a truncated competency, shown above `anchorRef`.
 * Pair with `useCompetencyTooltip`, which supplies `show` and `onHide`.
 * Render it inside the trigger element, so React treats the portaled tooltip as part of the trigger for mouse enter/leave.
 */
const CompetencyTooltip = ({
  anchorRef,
  show,
  name,
  externalId,
  onHide,
}: CompetencyTooltipProps) => {
  const intl = useIntl();
  // Paragon requires an `id`; nothing references it on purpose, because the trigger's own accessible name
  // already carries the full name and ID, and `aria-describedby` would read them twice.
  const id = useId();

  // `rootClose` dismisses on Escape (keyup) and on an outside click, without moving focus (WCAG 1.4.13).
  return (
    <Overlay
      target={() => anchorRef.current}
      show={show}
      onHide={onHide}
      rootClose
      placement="top"
      flip
    >
      <Tooltip
        id={id}
        className="competency-tooltip"
        variant="light"
      >
        <div>{name}</div>
        {externalId && <div>{intl.formatMessage(messages.competencyIdAccessibleLabel, { externalId })}</div>}
      </Tooltip>
    </Overlay>
  );
};

export default CompetencyTooltip;
