import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Dropdown, Form } from '@openedx/paragon';
import type { GradeRulePayload } from '../data/types';
import { formatScoreSummary } from './formatScoreSummary';
import messages from './messages';

export interface ScoreSettingsPopoverProps {
  rulePayload: GradeRulePayload;
  /** Commits a changed, valid payload. A rejection reverts the form. */
  onCommit: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Asks the owner to close. Called after a commit, an Enter with nothing changed, or Escape. */
  onRequestClose: () => void;
  /** Called with the payload about to be committed. A non-empty result blocks the commit and is shown inline. */
  getInlineValidationMessage?: (candidate: GradeRulePayload) => string;
  /** Shown under the controls when another box in the group already uses this score. */
  scoreTakenHint?: string;
  /** Renders `scoreTakenHint` as an error and marks the input invalid. */
  hintIsError?: boolean;
  /** When set, renders a "Use {score}" link under the score-taken hint. */
  scoreSuggestion?: { rulePayload: GradeRulePayload; onApply: () => void; };
  /** Which element carries `data-autofocus` for the owner's focus lock. */
  initialFocus: 'input' | 'suggestion';
}

/** `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage. */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

const OPERATOR_SYMBOLS: Record<GradeRulePayload['op'], string> = { gte: '>=', lte: '<=', eq: '=' };

export interface ScoreSettingsPopoverHandle {
  /** Resolves `true` when the owner may close (committed, or nothing changed) and `false` when
   * validation failed, a commit is already in flight, or the commit was rejected.
   */
  commit: () => Promise<boolean>;
}

/** Body of the popover that edits a rule box's comparison and score. Validates and commits on Enter,
 * or when the owner calls `commit` on the ref.
 */
const ScoreSettingsPopover = forwardRef<ScoreSettingsPopoverHandle, ScoreSettingsPopoverProps>(({
  rulePayload,
  onCommit,
  onRequestClose,
  getInlineValidationMessage,
  scoreTakenHint,
  hintIsError = false,
  scoreSuggestion,
  initialFocus,
}, ref) => {
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
  // While the operator menu is open, Escape only closes the menu.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    if (trimmedInput === '') {
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

  // No dependency array: the handle must hold the latest closure, so the owner never commits stale input.
  useImperativeHandle(ref, () => ({ commit }));

  const handleInputEnter = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Blocks Enter's default action, such as submitting an enclosing form.
      event.preventDefault();
      if (await commit()) {
        onRequestClose();
      }
    }
  };

  // On the root, so Escape discards the edit from any focused element, not only the input.
  const handleEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || isMenuOpen) {
      return;
    }
    // Keeps the owner's own Escape handler from committing the edit this keypress is discarding.
    event.stopPropagation();
    if (commitInFlight.current) {
      return;
    }
    revertToLastPersisted();
    onRequestClose();
  };

  // The commit-time message wins over the score-taken hint when both would show.
  const showAsInvalid = !!validationMessage || (!!scoreTakenHint && hintIsError);
  const focusScoreSuggestion = initialFocus === 'suggestion' && !!scoreSuggestion;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className="score-settings"
      onKeyDown={handleEscape}
    >
      <p id={headingId} className="score-settings__heading">
        {intl.formatMessage(messages.scoreSettingsHeading)}
      </p>
      <Form.Group controlId={inputId}>
        <div className="score-settings__row">
          <Dropdown onToggle={setIsMenuOpen}>
            <Dropdown.Toggle
              id={toggleId}
              variant="outline-primary"
              size="sm"
              aria-label={intl.formatMessage(messages.comparisonOperatorAccessibleLabel, {
                op: localOp,
              })}
            >
              {OPERATOR_SYMBOLS[localOp]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                as="button"
                type="button"
                active={localOp === 'gte'}
                onClick={() => setLocalOp('gte')}
              >
                {intl.formatMessage(messages.comparisonOptionLabel, { op: 'gte' })}
              </Dropdown.Item>
              <Dropdown.Item
                as="button"
                type="button"
                active={localOp === 'lte'}
                onClick={() => setLocalOp('lte')}
              >
                {intl.formatMessage(messages.comparisonOptionLabel, { op: 'lte' })}
              </Dropdown.Item>
              {rulePayload.op === 'eq' && (
                <Dropdown.Item as="button" type="button" disabled active={localOp === 'eq'}>
                  {intl.formatMessage(messages.comparisonOptionLabel, { op: 'eq' })}
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
            data-autofocus={!focusScoreSuggestion ? '' : undefined}
            onChange={(event) => setInputValue(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={handleInputEnter}
          />
          <span aria-hidden>%</span>
        </div>
        {validationMessage && (
          <Form.Control.Feedback type="invalid" hasIcon={false}>
            {validationMessage}
          </Form.Control.Feedback>
        )}
        {!validationMessage && scoreTakenHint && (
          <Form.Control.Feedback type={hintIsError ? 'invalid' : 'default'} hasIcon={false}>
            {scoreTakenHint}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      {scoreSuggestion && (
        <Button
          variant="link"
          size="inline"
          className="score-settings__suggestion"
          data-autofocus={focusScoreSuggestion ? '' : undefined}
          onClick={scoreSuggestion.onApply}
        >
          {intl.formatMessage(messages.useSuggestedScoreLink, {
            score: formatScoreSummary(intl, scoreSuggestion.rulePayload),
          })}
        </Button>
      )}
    </div>
  );
});

ScoreSettingsPopover.displayName = 'ScoreSettingsPopover';

export default ScoreSettingsPopover;
