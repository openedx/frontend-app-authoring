import { createIntl } from 'react-intl';
import { formatScoreSummary } from './formatScoreSummary';
import messages from './messages';

describe('formatScoreSummary', () => {
  it.each(
    [
      ['gte', 0.75, '75% or higher'],
      ['lte', 0.4, '40% or lower'],
      ['eq', 0.5, '50%'],
    ] as const,
  )('formats %s %s as "%s"', (op, value, expected) => {
    const intl = createIntl({ locale: 'en' });
    expect(formatScoreSummary(intl, { op, value, scale: 'percent' })).toBe(expected);
  });

  it('does not depend on the label message having a <threshold> tag', () => {
    const intl = createIntl({
      locale: 'en-GB',
      defaultLocale: 'en',
      messages: { [messages.scoreThresholdLabel.id]: 'A translation with no placeholders' },
    });
    expect(formatScoreSummary(intl, { op: 'gte', value: 0.75, scale: 'percent' })).toBe('75% or higher');
  });
});
