import formatDuration from './formatDuration';

describe('formatDuration', () => {
  test.each([
    [60, '01:00'],
    [35, '00:35'],
    [60 * 10 + 15, '10:15'],
    [60 * 60 + 60 * 15 + 13, '01:15:13'],
  ])('correct functionality of formatDuration with duration as %p', (duration, expected) => {
    expect(formatDuration(duration)).toEqual(expected);
  });
});
