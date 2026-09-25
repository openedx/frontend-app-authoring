import { useIntl } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
  /** Not exercised by `#672` (nothing here is editable): reserved so `#671`
   * and a later sibling editing ticket can wire in a change handler without
   * this component needing to be reshaped.
   */
  onChange?: (rulePayload: GradeRulePayload) => void;
  /** Same reservation as `onChange`, mirroring `EditableCell`'s prop of the
   * same name (`src/taxonomy/tree-table/EditableCell.tsx`).
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

/** Closed-state label for a rule's score threshold: "With a score of X%
 * or higher"/"or lower"/(no suffix, for an exact match). Read-only in
 * `#672` - see `onChange`/`getInlineValidationMessage` above for why the
 * props still exist.
 */
const ScoreThresholdField = ({ rulePayload }: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  // `rulePayload.value` is a 0.0-1.0 fraction (ADR 0002), not a 0-100
  // percentage - same conversion `src/grading-settings/credit-section/
  // index.jsx` uses for the same kind of field.
  const percent = Math.round(rulePayload.value * 100);
  const suffixMessage = SUFFIX_MESSAGE_BY_OP[rulePayload.op];

  return (
    <span className="score-threshold-field">
      {intl.formatMessage(messages.scoreThresholdLabel, { percent })}
      {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
    </span>
  );
};

export default ScoreThresholdField;
