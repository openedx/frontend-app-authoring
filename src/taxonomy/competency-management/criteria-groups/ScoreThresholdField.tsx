import { useIntl } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
}

/** `null` for `eq`, which reads as an exact score with no suffix. */
const SUFFIX_MESSAGE_BY_OP: Record<GradeRulePayload['op'], MessageDescriptor | null> = {
  gte: messages.scoreThresholdOrHigherSuffix,
  lte: messages.scoreThresholdOrLowerSuffix,
  eq: null,
};

/** Label stating a rule box's score threshold: "With a score of X% or
 * higher"/"or lower"/(no suffix, for an exact match).
 */
const ScoreThresholdField = ({ rulePayload }: ScoreThresholdFieldProps) => {
  const intl = useIntl();
  // `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage.
  const percent = Math.round(rulePayload.value * 100);
  const suffixMessage = SUFFIX_MESSAGE_BY_OP[rulePayload.op];

  return (
    <span className="score-threshold-field">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        threshold: (
          <span key="threshold" className="score-threshold-field__value">
            {intl.formatMessage(messages.scoreThresholdValue, { percent })}
            {suffixMessage && ` ${intl.formatMessage(suffixMessage)}`}
          </span>
        ),
      })}
    </span>
  );
};

export default ScoreThresholdField;
