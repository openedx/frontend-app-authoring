import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, MutableRefObject } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Dropdown, Form } from '@openedx/paragon';
import type { GradeRulePayload } from '../data/types';
import { formatScoreSummary } from './ScoreThresholdField';
import messages from './messages';

export interface ScoreSettingsPopoverProps {
  rulePayload: GradeRulePayload;
  /** Commits a changed, valid payload. A rejection reverts the form. */
  onCommit: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Asks the owner to close. Called after a commit, an Enter with nothing changed, or Escape. */
  onRequestClose: () => void;
  /** Called with the payload about to be committed. A non-empty result blocks the commit and is shown inline. */
  getInlineValidationMessage?: (candidate: GradeRulePayload) => string;
  /** Guidance under the controls. */
  hint?: string;
  /** Renders `hint` as an error and marks the input invalid. */
  hintIsError?: boolean;
  /** When set, renders a "Use {score}" link under the hint. */
  suggestion?: { rulePayload: GradeRulePayload; onApply: () => void; };
  /** Which element carries `data-autofocus` for the owner's focus lock. */
  initialFocus: 'input' | 'suggestion';
  /** Filled with the commit function, so the owner can commit on a click outside. The function
   * resolves `true` when the owner may close (committed, or nothing changed) and `false` when
   * validation failed, a commit is already in flight, or the commit was rejected.
   */
  commitRef?: MutableRefObject<(() => Promise<boolean>) | null>;
}

/** `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage. */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

const OPERATOR_SYMBOLS: Record<GradeRulePayload['op'], string> = { gte: '>=', lte: '<=', eq: '=' };

const OPERATOR_LABELS = {
  gte: messages.comparisonGteLabel,
  lte: messages.comparisonLteLabel,
  eq: messages.comparisonEqLabel,
};

/** Body of the popover that edits a rule box's comparison and score. Validates and commits on Enter,
 * or when the owner calls `commitRef.current`.
 */
const ScoreSettingsPopover = ({
  rulePayload,
  onCommit,
  onRequestClose,
  getInlineValidationMessage,
  hint,
  hintIsError = false,
  suggestion,
  initialFocus,
  commitRef,
}: ScoreSettingsPopoverProps) => {
  const intl = useIntl();
  const headingId = useId();
  const inputId = useId();
  const toggleId = useId();

  const [inputValue, setInputValue] = useState(() => percentOf(rulePayload));
  const [localOp, setLocalOp] = useState(rulePayload.op);
  const [validationMessage, setValidationMessage] = useState('');
  // A ref, so a second commit in the same tick sees it before React re-renders and cannot race the first.
  const commitInFlight = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const revertToLastPersisted = () => {
    setInputValue(percentOf(rulePayload));
    setLocalOp(rulePayload.op);
    setValidationMessage('');
  };

  const commit = async (): Promise<boolean> => {
    if (commitInFlight.current) {
      return false;
    }
    const trimmedInput = inputValue.trim();
    const numericPercent = Number(trimmedInput);
    if (trimmedInput === '' || !Number.isFinite(numericPercent)) {
      revertToLastPersisted();
      return true;
    }
    if (!Number.isInteger(numericPercent) || numericPercent < 0 || numericPercent > 100) {
      setValidationMessage(intl.formatMessage(messages.scoreThresholdRangeValidationMessage));
      return false;
    }
    if (String(numericPercent) === percentOf(rulePayload) && localOp === rulePayload.op) {
      // Skipped so a no-op close does not re-send the rounded display value over the stored fraction.
      setValidationMessage('');
      return true;
    }
    const message = getInlineValidationMessage
      ? getInlineValidationMessage({ ...rulePayload, op: localOp, value: numericPercent / 100 })
      : '';
    if (message) {
      setValidationMessage(message);
      return false;
    }
    setValidationMessage('');
    commitInFlight.current = true;
    setIsSaving(true);
    try {
      await onCommit({ ...rulePayload, op: localOp, value: numericPercent / 100 });
      return true;
    } catch {
      revertToLastPersisted();
      return false;
    } finally {
      commitInFlight.current = false;
      setIsSaving(false);
    }
  };

  // Always the latest closure, so the owner's ref never commits stale input.
  const commitRefLatest = useRef(commit);
  useLayoutEffect(() => {
    commitRefLatest.current = commit;
  });

  useEffect(() => {
    if (!commitRef) {
      return undefined;
    }
    const ref = commitRef;
    ref.current = () => commitRefLatest.current();
    return () => {
      ref.current = null;
    };
  }, [commitRef]);

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (await commit()) {
        onRequestClose();
      }
    } else if (event.key === 'Escape') {
      // Keeps the owner's own Escape handler from committing the input this keypress is reverting.
      event.stopPropagation();
      if (commitInFlight.current) {
        return;
      }
      revertToLastPersisted();
      onRequestClose();
    }
  };

  // The commit-time message wins over the hint when both would show.
  const showAsInvalid = !!validationMessage || (!!hint && hintIsError);
  const focusSuggestion = initialFocus === 'suggestion' && !!suggestion;

  return (
    <div role="dialog" aria-labelledby={headingId} className="score-settings">
      <p id={headingId} className="score-settings__heading">
        {intl.formatMessage(messages.scoreSettingsHeading)}
      </p>
      <Form.Group controlId={inputId}>
        <div className="score-settings__row">
          <Dropdown>
            <Dropdown.Toggle
              id={toggleId}
              variant="outline-primary"
              size="sm"
              aria-label={intl.formatMessage(messages.comparisonOperatorAccessibleLabel, {
                operator: intl.formatMessage(OPERATOR_LABELS[localOp]),
              })}
            >
              {OPERATOR_SYMBOLS[localOp]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                as="button"
                type="button"
                active={localOp === 'gte'}
                aria-label={intl.formatMessage(messages.comparisonGteLabel)}
                onClick={() => setLocalOp('gte')}
              >
                {OPERATOR_SYMBOLS.gte}
              </Dropdown.Item>
              <Dropdown.Item
                as="button"
                type="button"
                active={localOp === 'lte'}
                aria-label={intl.formatMessage(messages.comparisonLteLabel)}
                onClick={() => setLocalOp('lte')}
              >
                {OPERATOR_SYMBOLS.lte}
              </Dropdown.Item>
              {rulePayload.op === 'eq' && (
                <Dropdown.Item as="button" type="button" disabled active={localOp === 'eq'}>
                  {OPERATOR_SYMBOLS.eq}
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            type="text"
            inputMode="numeric"
            size="sm"
            className="score-settings__input"
            value={inputValue}
            aria-label={intl.formatMessage(messages.scoreThresholdInputAccessibleLabel)}
            aria-invalid={showAsInvalid}
            isInvalid={showAsInvalid}
            readOnly={isSaving}
            aria-busy={isSaving}
            data-autofocus={!focusSuggestion ? '' : undefined}
            onChange={(event) => setInputValue(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={handleKeyDown}
          />
          <span aria-hidden>%</span>
        </div>
        {validationMessage && (
          <Form.Control.Feedback type="invalid" hasIcon={false}>
            {validationMessage}
          </Form.Control.Feedback>
        )}
        {!validationMessage && hint && (
          <Form.Control.Feedback type={hintIsError ? 'invalid' : 'default'} hasIcon={false}>
            {hint}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      {suggestion && (
        <Button
          variant="link"
          size="inline"
          className="score-settings__suggestion"
          data-autofocus={focusSuggestion ? '' : undefined}
          onClick={suggestion.onApply}
        >
          {intl.formatMessage(messages.useSuggestedScoreLink, {
            score: formatScoreSummary(intl, suggestion.rulePayload),
          })}
        </Button>
      )}
    </div>
  );
};

export default ScoreSettingsPopover;
