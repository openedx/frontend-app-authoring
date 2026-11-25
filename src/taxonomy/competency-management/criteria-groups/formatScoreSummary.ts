import type { IntlShape } from 'react-intl';
import type { GradeRulePayload } from '../data/types';
import messages from './messages';

/** A score as text, such as "75% or higher", for messages that name a score. */
export const formatScoreSummary = (intl: IntlShape, rulePayload: GradeRulePayload): string => (
  intl.formatMessage(messages.scoreThresholdPhrase, {
    op: rulePayload.op,
    value: intl.formatNumber(rulePayload.value, { style: 'percent', maximumFractionDigits: 0 }),
  })
);
