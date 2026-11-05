import { useIntl } from '@edx/frontend-platform/i18n';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

export interface ScoreThresholdFieldProps {
  rulePayload: GradeRulePayload;
}

/** Label stating a rule box's score threshold, for example "With a score of 70% or higher". */
const ScoreThresholdField = ({ rulePayload }: ScoreThresholdFieldProps) => {
  const intl = useIntl();

  return (
    <span className="score-threshold-field">
      {intl.formatMessage(messages.scoreThresholdLabel, {
        op: rulePayload.op,
        // `rulePayload.value` is a 0.0-1.0 fraction (openedx-core ADR 0002), not a 0-100 percentage.
        value: intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 1 }),
        threshold: (chunks: React.ReactNode[]) => (
          <span key="threshold" className="score-threshold-field__value">{chunks}</span>
        ),
      })}
    </span>
  );
};

export default ScoreThresholdField;
