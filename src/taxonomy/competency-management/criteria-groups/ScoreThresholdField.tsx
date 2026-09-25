import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import type { MessageDescriptor } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
  /** Omitted by `#672`, which only ever reads `rulePayload`: renders plain,
   * non-interactive text in that case. `#794` passes this to get the
   * editable input instead. Returns a `Promise` so this component's own
   * commit handler can revert its local input on a rejected save - the
   * mutation itself still lives in `CompetencyAssociationsContext`.
   */
  onChange?: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Same reservation as `onChange`, mirroring `EditableCell`'s prop of the
   * same name. Per-keystroke and display-only - it never blocks a commit by
   * itself; `commit` below is what gates the commit on it.
   */
  getInlineValidationMessage?: (value: string) => string;
}

/** Which suffix follows the percentage for each comparison operator -
 * `null` for `eq`, which reads as an exact score with no suffix.
 */
const SUFFIX_MESSAGE_BY_OP: Record<GradeRulePayload['op'], MessageDescriptor | null> = {
  gte: messages.scoreThresholdOrHigherSuffix,
  lte: messages.scoreThresholdOrLowerSuffix,
  eq: null,
};

/** `rulePayload.value` is a 0.0-1.0 fraction, not a 0-100 percentage - same
 * conversion `src/grading-settings/credit-section/index.jsx` uses.
 */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

/** Closed-state label for a rule's score threshold: "With a score of X%
 * or higher"/"or lower"/(no suffix, for an exact match). Read-only unless
 * `onChange` is given, in which case the percentage renders as an editable
 * input instead - same "read-only unless given a handler" shape
 * `LogicOperatorSelect` already uses.
 */
const ScoreThresholdField = ({ rulePayload, onChange, getInlineValidationMessage }: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  const percent = Math.round(rulePayload.value * 100);
  const suffixMessage = SUFFIX_MESSAGE_BY_OP[rulePayload.op];

  // Local input state, mirroring `EditableCell`'s own pattern - never
  // resynced from `rulePayload` while mounted. A successful edit gets a
  // fresh value for free, since `RuleBoxList`'s `key={box.key}` remounts
  // this box once its rule key changes. A rejected edit doesn't change that
  // key, so it needs its own explicit revert (see `commit` below).
  const [inputValue, setInputValue] = useState(() => percentOf(rulePayload));
  const [validationMessage, setValidationMessage] = useState('');

  if (!onChange) {
    return (
      <span className="score-threshold-field">
        {intl.formatMessage(messages.scoreThresholdLabel, { percent })}
        {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
      </span>
    );
  }

  const revertToLastPersisted = () => {
    setInputValue(percentOf(rulePayload));
    setValidationMessage('');
  };

  const commit = () => {
    const trimmedInput = inputValue.trim();
    const numericPercent = Number(trimmedInput);
    if (trimmedInput === '' || !Number.isFinite(numericPercent)) {
      revertToLastPersisted();
      return;
    }
    if (numericPercent === Math.round(rulePayload.value * 100)) {
      // Nothing actually changed - e.g. a blur or Enter with no edit made,
      // or a re-typed value that round-trips to the same displayed percent.
      // Skip the request rather than re-sending the current value, which
      // (given the display itself is a rounded percent) could otherwise
      // silently move a stored fraction by a rounding error.
      setValidationMessage('');
      return;
    }
    const message = getInlineValidationMessage ? getInlineValidationMessage(inputValue) : '';
    if (message) {
      // getInlineValidationMessage only sets the inline message by itself;
      // gating the actual commit on it is this component's own work.
      setValidationMessage(message);
      return;
    }
    setValidationMessage('');
    const newRulePayload: GradeRulePayload = { ...rulePayload, value: numericPercent / 100 };
    onChange(newRulePayload).catch(() => {
      // Unlike `LogicOperatorSelect`'s `Dropdown` (which always renders
      // from its `value` prop), this input's local state doesn't
      // self-correct on rejection - revert it explicitly.
      revertToLastPersisted();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commit();
    } else if (event.key === 'Escape') {
      revertToLastPersisted();
    }
    // Stops the wrapping `RuleBox`'s own `onKeyDown` (Enter/Space ->
    // `focusRuleBox`) from also firing while typing inside this input.
    event.stopPropagation();
  };

  return (
    <span className="score-threshold-field score-threshold-field--editable">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        percent: (
          <Form.Control
            key="score-input"
            type="text"
            inputMode="numeric"
            size="sm"
            className="score-threshold-field__input"
            value={inputValue}
            aria-label={intl.formatMessage(messages.scoreThresholdInputAccessibleLabel)}
            isInvalid={!!validationMessage}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
          />
        ),
      })}
      {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
      {validationMessage && (
        <div role="alert" aria-live="polite" className="text-danger small">
          {validationMessage}
        </div>
      )}
    </span>
  );
};

export default ScoreThresholdField;
