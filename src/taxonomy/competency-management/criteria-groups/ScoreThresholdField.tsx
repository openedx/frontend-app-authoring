import {
  useEffect,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, ModalPopup } from '@openedx/paragon';
import { ExpandMore } from '@openedx/paragon/icons';
import type { IntlShape } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import ScoreSettingsPopover from './ScoreSettingsPopover';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
  /** When given, the sentence is a button that opens the score settings popover. Returns a `Promise` so a
   * rejected save reverts the popover's form; the mutation itself lives in `CompetencyAssociationsContext`.
   */
  onChange?: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Called with the payload about to be saved. A non-empty result blocks the save and is shown in the popover. */
  getInlineValidationMessage?: (candidate: GradeRulePayload) => string;
  /** Opens the popover on mount, with focus in the percentage input. */
  autoOpen?: boolean;
  /** Guidance in the popover. */
  hint?: string;
  /** Renders `hint` as an error and opens the popover with focus on the suggestion link, or on the input
   * when there is no link.
   */
  hintIsError?: boolean;
  /** Changes on every repeat rejection, so the popover reopens and refocuses each time. */
  rejectionCount?: number;
  /** Shown in the popover as a "Use {score}" link. */
  suggestion?: { rulePayload: GradeRulePayload; onApply: () => void; };
}

/** A score as text, such as "75% or higher", for messages that name a score. */
export const formatScoreSummary = (intl: IntlShape, rulePayload: GradeRulePayload): string => (
  intl.formatMessage(messages.scoreThresholdPhrase, {
    op: rulePayload.op,
    value: intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 0 }),
  })
);

/** Label stating a rule box's score threshold, for example "With a score of 70% or higher".
 * With `onChange`, the label is a button that opens a popover to edit the comparison and the percentage.
 */
const ScoreThresholdField = ({
  rulePayload,
  onChange,
  getInlineValidationMessage,
  autoOpen = false,
  hint,
  hintIsError = false,
  rejectionCount,
  suggestion,
}: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(autoOpen || hintIsError);
  // Held in state rather than a ref, because `ModalPopup` needs the anchor element on the first render when
  // `autoOpen` is set, and a ref object is still null then.
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const commitRef: MutableRefObject<(() => Promise<boolean>) | null> = useRef(null);
  const initialFocus = hintIsError && suggestion ? 'suggestion' : 'input';

  useEffect(() => {
    if (!hintIsError) {
      return;
    }
    // The focus lock only focuses on activation, so a repeat rejection while open moves focus itself.
    const target = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');
    if (target) {
      target.focus();
    } else {
      setIsOpen(true);
    }
  }, [hintIsError, rejectionCount]);

  const handleCloseRequest = async () => {
    if (!isOpen) {
      return;
    }
    const mayClose = await commitRef.current?.() ?? true;
    if (mayClose) {
      setIsOpen(false);
    }
  };

  const sentence = (value: string) => (
    intl.formatMessage(messages.scoreThresholdLabel, {
      score: intl.formatMessage(messages.scoreThresholdPhrase, { op: rulePayload.op, value }),
      threshold: (chunks: React.ReactNode[]) => (
        <span key="threshold" className="score-threshold-field__value">{chunks}</span>
      ),
    })
  );
  const percent = intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 0 });

  if (!onChange) {
    return (
      <span className="score-threshold-field">
        <span className="score-threshold-field__sentence">{sentence(percent)}</span>
      </span>
    );
  }

  return (
    <span className="score-threshold-field">
      <button
        ref={setAnchor}
        type="button"
        className="score-threshold-field__sentence score-threshold-field__toggle"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {sentence(percent)}
        <Icon src={ExpandMore} size="xs" />
      </button>
      <ModalPopup
        isOpen={isOpen}
        positionRef={anchor}
        onClose={handleCloseRequest}
        placement="bottom-start"
      >
        <div ref={panelRef} className="score-threshold-field__panel shadow">
          <ScoreSettingsPopover
            rulePayload={rulePayload}
            onCommit={onChange}
            onRequestClose={() => setIsOpen(false)}
            getInlineValidationMessage={getInlineValidationMessage}
            hint={hint}
            hintIsError={hintIsError}
            suggestion={suggestion}
            initialFocus={initialFocus}
            commitRef={commitRef}
          />
        </div>
      </ModalPopup>
    </span>
  );
};

export default ScoreThresholdField;
