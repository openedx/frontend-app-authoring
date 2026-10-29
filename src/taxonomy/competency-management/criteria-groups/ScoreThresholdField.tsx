import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Icon } from '@openedx/paragon';
import { ExpandMore } from '@openedx/paragon/icons';
import type { MessageDescriptor } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
  /** Omitted: renders plain text. Given: renders the editable input, and the returned promise lets
   * `saveScoreIfChanged` revert its local input on a rejected save.
   */
  onChange?: (rulePayload: GradeRulePayload) => Promise<void>;
  /** Called once at commit time, from `saveScoreIfChanged` below; a non-empty return blocks the
   * commit and shows the message inline instead.
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

/** `rulePayload.value` is a 0.0-1.0 fraction, not a 0-100 percentage. */
const percentOf = (rulePayload: GradeRulePayload): string => String(Math.round(rulePayload.value * 100));

/** Closed-state label for a rule's score threshold: "With a score of X% or higher"/"or lower"/
 * (no suffix, for an exact match). Read-only unless `onChange` is given. */
const ScoreThresholdField = ({ rulePayload, onChange, getInlineValidationMessage }: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  const inputId = useId();
  const percent = Math.round(rulePayload.value * 100);
  const suffixMessage = SUFFIX_MESSAGE_BY_OP[rulePayload.op];

  // Local input state, mirroring `EditableCell`'s pattern - never resynced from `rulePayload`
  // while mounted; a rejected edit needs its own explicit revert (see `saveScoreIfChanged` below).
  const [inputValue, setInputValue] = useState(() => percentOf(rulePayload));
  const [validationMessage, setValidationMessage] = useState('');
  // Guards against a second commit (e.g. blur right after Enter) firing before the first
  // mutation resolves, which could otherwise let two out-of-order responses land in the wrong order.
  const saveInFlight = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!onChange) {
    return (
      <span className="score-threshold-field">
        {intl.formatMessage(messages.scoreThresholdLabel, {
          threshold: (
            <span key="threshold" className="score-threshold-field__value">
              {intl.formatMessage(messages.scoreThresholdValue, { percent })}
              {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
              <Icon src={ExpandMore} size="xs" className="score-threshold-field__chevron" />
            </span>
          ),
        })}
      </span>
    );
  }

  const revertToLastPersisted = () => {
    setInputValue(percentOf(rulePayload));
    setValidationMessage('');
  };

  const saveScoreIfChanged = async () => {
    if (saveInFlight.current) {
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
      setValidationMessage('');
      return;
    }
    const message = getInlineValidationMessage ? getInlineValidationMessage(inputValue) : '';
    if (message) {
      setValidationMessage(message);
      return;
    }
    setValidationMessage('');
    const newRulePayload: GradeRulePayload = { ...rulePayload, value: numericPercent / 100 };
    saveInFlight.current = true;
    setIsSaving(true);
    try {
      await onChange(newRulePayload);
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

  return (
    <Form.Group as="span" controlId={inputId} className="score-threshold-field score-threshold-field--editable">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        threshold: (
          <span key="threshold" className="score-threshold-field__value score-threshold-field__value--editable">
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
              onChange={(event) =>
                setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                void saveScoreIfChanged();
              }}
            />
            %
          </span>
        ),
      })}
      {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
      {validationMessage && (
        <Form.Control.Feedback type="invalid" hasIcon={false}>
          {validationMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default ScoreThresholdField;
