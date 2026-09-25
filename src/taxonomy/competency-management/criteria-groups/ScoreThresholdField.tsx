import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
  /** When given, the percentage renders as an editable input. Returns a `Promise` so a rejected save
   * reverts the input; the mutation itself lives in `CompetencyAssociationsContext`.
   */
  onChange?: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Per-keystroke, display-only message. A non-empty result also blocks the commit. */
  getInlineValidationMessage?: (value: string) => string;
}

/** `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage. */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

/** Label stating a rule box's score threshold, for example "With a score of 70% or higher".
 * The percentage is editable when `onChange` is given.
 */
const ScoreThresholdField = ({ rulePayload, onChange, getInlineValidationMessage }: ScoreThresholdFieldProps) => {
  const intl = useIntl();

  // Not resynced from `rulePayload` while mounted: a successful edit changes the rule key, which
  // remounts the box via `RuleBoxList`'s `key`. A rejected edit keeps the key, so it reverts explicitly.
  const [inputValue, setInputValue] = useState(() => percentOf(rulePayload));
  const [validationMessage, setValidationMessage] = useState('');

  const revertToLastPersisted = () => {
    setInputValue(percentOf(rulePayload));
    setValidationMessage('');
  };

  const commit = () => {
    if (!onChange) {
      return;
    }
    const trimmedInput = inputValue.trim();
    const numericPercent = Number(trimmedInput);
    if (trimmedInput === '' || !Number.isFinite(numericPercent)) {
      revertToLastPersisted();
      return;
    }
    if (numericPercent === Math.round(rulePayload.value * 100)) {
      // Skipped so a blur with no edit does not re-send the rounded display value over the stored fraction.
      setValidationMessage('');
      return;
    }
    const message = getInlineValidationMessage ? getInlineValidationMessage(inputValue) : '';
    if (message) {
      setValidationMessage(message);
      return;
    }
    setValidationMessage('');
    onChange({ ...rulePayload, value: numericPercent / 100 }).catch(revertToLastPersisted);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commit();
    } else if (event.key === 'Escape') {
      revertToLastPersisted();
    }
    // Keeps the wrapping `RuleBox`'s Enter/Space handler from firing while typing.
    event.stopPropagation();
  };

  // `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage.
  const value = onChange
    ? (
      <>
        <Form.Control
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
        %
      </>
    )
    : intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 0 });

  return (
    <span className="score-threshold-field">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        op: rulePayload.op,
        value,
        threshold: (chunks: React.ReactNode[]) => (
          <span key="threshold" className="score-threshold-field__value">{chunks}</span>
        ),
      })}
      {validationMessage && (
        <div role="alert" aria-live="polite" className="text-danger small">
          {validationMessage}
        </div>
      )}
    </span>
  );
};

export default ScoreThresholdField;
