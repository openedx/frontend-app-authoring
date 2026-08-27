import {
  formatTimestamp,
  isValidSrt,
  parseSrt,
  parseTimestamp,
  serializeSrt,
} from './srtUtils';

const SRT = [
  '1',
  '00:00:01,000 --> 00:00:02,500',
  'Hello there',
  '',
  '2',
  '00:00:03,000 --> 00:00:04,000',
  'Second cue',
].join('\n');

describe('parseSrt', () => {
  it('parses indexed cue blocks', () => {
    expect(parseSrt(SRT)).toEqual([
      { startTime: '00:00:01,000', endTime: '00:00:02,500', text: 'Hello there' },
      { startTime: '00:00:03,000', endTime: '00:00:04,000', text: 'Second cue' },
    ]);
  });

  it('parses cue blocks without index lines', () => {
    const noIndex = '00:00:01,000 --> 00:00:02,000\nHi\n\n00:00:03,000 --> 00:00:04,000\nBye';
    expect(parseSrt(noIndex)).toEqual([
      { startTime: '00:00:01,000', endTime: '00:00:02,000', text: 'Hi' },
      { startTime: '00:00:03,000', endTime: '00:00:04,000', text: 'Bye' },
    ]);
  });

  it('keeps multi-line cue text together', () => {
    const multi = '1\n00:00:01,000 --> 00:00:02,000\nline one\nline two';
    expect(parseSrt(multi)[0].text).toBe('line one\nline two');
  });

  it('drops blocks with a malformed timestamp line', () => {
    const partiallyBroken = `${SRT}\n\n3\nnot a timestamp\nBroken`;
    expect(parseSrt(partiallyBroken)).toHaveLength(2);
  });

  it('returns an empty list for empty or non-string input', () => {
    expect(parseSrt('')).toEqual([]);
    expect(parseSrt(null)).toEqual([]);
    expect(parseSrt(undefined)).toEqual([]);
  });
});

describe('serializeSrt', () => {
  it('re-numbers cues and round-trips through parseSrt', () => {
    const cues = parseSrt(SRT);
    const serialized = serializeSrt(cues);
    expect(serialized.startsWith('1\n00:00:01,000 --> 00:00:02,500\nHello there')).toBe(true);
    expect(parseSrt(serialized)).toEqual(cues);
  });
});

describe('parseTimestamp / formatTimestamp', () => {
  it('parses SRT timestamps into seconds', () => {
    expect(parseTimestamp('01:02:03,450')).toBeCloseTo(3723.45);
    expect(parseTimestamp('00:00:00,000')).toBe(0);
  });

  it('formats seconds into SRT timestamps and round-trips', () => {
    expect(formatTimestamp(3723.45)).toBe('01:02:03,450');
    expect(parseTimestamp(formatTimestamp(59.999))).toBeCloseTo(59.999);
  });

  it('clamps negative and non-numeric input to zero', () => {
    expect(formatTimestamp(-5)).toBe('00:00:00,000');
    expect(formatTimestamp(NaN)).toBe('00:00:00,000');
  });
});

describe('isValidSrt', () => {
  it('accepts well-formed content, with or without index lines', () => {
    expect(isValidSrt(SRT)).toBe(true);
    expect(isValidSrt('00:00:01,000 --> 00:00:02,000\nHi')).toBe(true);
  });

  it('treats empty or blank content as a valid empty transcript', () => {
    expect(isValidSrt('')).toBe(true);
    expect(isValidSrt(null)).toBe(true);
    expect(isValidSrt('   \n \n  ')).toBe(true);
  });

  it('rejects content where any block is malformed', () => {
    expect(isValidSrt(`${SRT}\n\n3\nnot a timestamp\nBroken`)).toBe(false);
    expect(isValidSrt('just some text')).toBe(false);
  });
});
