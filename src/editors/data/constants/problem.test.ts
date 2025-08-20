import { getProblemTitles } from '@src/editors/data/constants/problem';

describe('getProblemTitles', () => {
  it('returns a set of localized problem titles', () => {
    const formatMessage = (msg) => msg.id || msg.defaultMessage || String(msg);
    const titles = getProblemTitles(formatMessage);

    expect(titles.size).toBeGreaterThan(0);
    for (const title of titles) {
      expect(typeof title).toBe('string');
    }
  });
});
