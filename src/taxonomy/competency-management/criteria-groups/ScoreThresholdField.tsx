import { useId, useRef, useState } from 'react';
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
  /** Called when saving. A non-empty result blocks the save and is shown inline. */
  getInlineValidationMessage?: (value: string) => string;
}

/** `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage. */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

/** Label stating a rule box's score threshold, for example "With a score of 70% or higher".
 * The percentage is editable when `onChange` is given.
 */
const ScoreThresholdField = ({ rulePayload, onChange, getInlineValidationMessage }: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  const inputId = useId();

  // Not resynced from `rulePayload` while mounted: a successful edit changes the rule key, which
  // remounts the box via `RuleBoxList`'s `key`. A rejected edit keeps the key, so it reverts explicitly.
  const [inputValue, setInputValue] = useState(() => percentOf(rulePayload));
  const [validationMessage, setValidationMessage] = useState('');
  // A ref, so a blur fired by the same Enter keypress sees it before React re-renders. Keeps a second save
  // from racing the first, whose response could otherwise land out of order.
  const saveInFlight = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const revertToLastPersisted = () => {
    setInputValue(percentOf(rulePayload));
    setValidationMessage('');
  };

  const saveScoreIfChanged = async () => {
    if (!onChange || saveInFlight.current) {
      return;
    }
    const trimmedInput = inputValue.trim();
    const numericPercent = Number(trimmedInput);
    if (trimmedInput === '' || !Number.isFinite(numericPercent)) {
      revertToLastPersisted();
      return;
    }
    if (!Number.isInteger(numericPercent) || numericPercent < 0 || numericPercent > 100) {
      setValidationMessage(intl.formatMessage(messages.scoreThresholdRangeValidationMessage));
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
    saveInFlight.current = true;
    setIsSaving(true);
    try {
      await onChange({ ...rulePayload, value: numericPercent / 100 });
    } catch {
      revertToLastPersisted();
    } finally {
      saveInFlight.current = false;
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void saveScoreIfChanged();
    } else if (event.key === 'Escape') {
      revertToLastPersisted();
    }
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
          aria-invalid={!!validationMessage}
          isInvalid={!!validationMessage}
          disabled={isSaving}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            void saveScoreIfChanged();
          }}
        />
        %
      </>
    )
    : intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 0 });

  return (
    <Form.Group as="span" controlId={inputId} className="score-threshold-field">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        op: rulePayload.op,
        value,
        threshold: (chunks: React.ReactNode[]) => (
          <span key="threshold" className="score-threshold-field__value">{chunks}</span>
        ),
      })}
      {validationMessage && (
        <Form.Control.Feedback type="invalid" hasIcon={false}>
          {validationMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default ScoreThresholdField;
