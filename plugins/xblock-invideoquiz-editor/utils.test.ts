jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

import {
  normalizeProblemIds,
  normalizeJumpBackField,
  normalizeTimeKey,
  resolveQuizItemJumpBack,
  parseJumpBackField,
  expandTimemapToQuizItems,
  buildTimemapFromQuizItems,
  buildJumpBackFromQuizItems,
  parseStudioViewHtml,
  extractBlockId,
  GLOBAL_JUMP_BACK_KEY,
} from './utils';

describe('InVideoQuizEditor utils', () => {
  describe('extractBlockId', () => {
    it('extracts the block id from a full usage key', () => {
      expect(extractBlockId('block-v1:org+course+run+type@video+block@video-1')).toBe('video-1');
    });
  });

  describe('normalizeProblemIds', () => {
    it('returns array for array input', () => {
      expect(normalizeProblemIds(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('wraps string in array', () => {
      expect(normalizeProblemIds('problem-1')).toEqual(['problem-1']);
    });

    it('returns empty array for falsy input', () => {
      expect(normalizeProblemIds('')).toEqual([]);
      expect(normalizeProblemIds(null)).toEqual([]);
    });
  });

  describe('normalizeTimeKey', () => {
    it('leaves MM:SS values unchanged', () => {
      expect(normalizeTimeKey('1:30')).toBe('1:30');
    });

    it('converts a plain-seconds legacy value to MM:SS', () => {
      expect(normalizeTimeKey('90')).toBe('1:30');
      expect(normalizeTimeKey('5')).toBe('0:05');
    });

    it('returns non-numeric input unchanged', () => {
      expect(normalizeTimeKey('not-a-number')).toBe('not-a-number');
    });
  });

  describe('expandTimemapToQuizItems', () => {
    it('expands legacy single-problem timemap', () => {
      const items = expandTimemapToQuizItems({ '1:30': 'problem-1' }, { '1:30': '0:45' });
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        problemId: 'problem-1',
        time: '1:30',
        jumpBack: '0:45',
      });
    });

    it('expands multi-problem timemap into separate rows', () => {
      const items = expandTimemapToQuizItems({
        '1:30': ['problem-1', 'problem-2'],
      });
      expect(items).toHaveLength(2);
      expect(items[0].problemId).toBe('problem-1');
      expect(items[1].problemId).toBe('problem-2');
      expect(items[0].time).toBe('1:30');
      expect(items[1].time).toBe('1:30');
    });

    it('assigns per-problem jump back for problems at the same timestamp', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        { 'problem-1': '1:29', 'problem-2': '1:35' },
      );
      expect(items).toHaveLength(2);
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:35');
    });

    it('falls back to legacy time-keyed jump back', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': 'problem-1' },
        { '1:30': '1:00' },
      );
      expect(items[0].jumpBack).toBe('1:00');
    });

    it('applies legacy global jump back string to every problem row', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        '1:29',
      );
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:29');
    });

    it('normalizes a legacy plain-seconds time key to MM:SS', () => {
      const items = expandTimemapToQuizItems({ '90': 'problem-1' });
      expect(items[0].time).toBe('1:30');
    });

    it('resolves jump back keyed by the raw legacy time when the timemap key is plain seconds', () => {
      const items = expandTimemapToQuizItems({ '90': 'problem-1' }, { '90': '0:10' });
      expect(items[0].time).toBe('1:30');
      expect(items[0].jumpBack).toBe('0:10');
    });
  });

  describe('normalizeJumpBackField', () => {
    it('wraps legacy global MM:SS string', () => {
      expect(normalizeJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('returns object maps unchanged', () => {
      expect(normalizeJumpBackField({ 'problem-1': '1:29' })).toEqual({
        'problem-1': '1:29',
      });
    });

    it('returns empty map for falsy input', () => {
      expect(normalizeJumpBackField('')).toEqual({});
      expect(normalizeJumpBackField(null)).toEqual({});
      expect(normalizeJumpBackField(undefined)).toEqual({});
    });

    it('returns empty map for whitespace-only string', () => {
      expect(normalizeJumpBackField('   ')).toEqual({});
    });

    it('parses a JSON object string into a per-problem map', () => {
      expect(normalizeJumpBackField('{"problem-1":"1:29"}')).toEqual({
        'problem-1': '1:29',
      });
    });

    it('returns empty map for malformed JSON-looking string', () => {
      expect(normalizeJumpBackField('{not valid json')).toEqual({});
    });

    it('returns empty map for a value that is neither string nor object', () => {
      expect(normalizeJumpBackField(42 as any)).toEqual({});
    });
  });

  describe('resolveQuizItemJumpBack', () => {
    it('prefers per-problem value over time and default', () => {
      const map = { 'problem-1': '1:29', '1:30': '1:00', [GLOBAL_JUMP_BACK_KEY]: '0:30' };
      expect(resolveQuizItemJumpBack(map, 'problem-1', '1:30')).toBe('1:29');
    });

    it('falls back to time-keyed legacy value', () => {
      expect(resolveQuizItemJumpBack({ '1:30': '1:00' }, 'problem-1', '1:30')).toBe('1:00');
    });

    it('falls back to global default', () => {
      expect(resolveQuizItemJumpBack({ [GLOBAL_JUMP_BACK_KEY]: '0:45' }, 'problem-1', '1:30')).toBe('0:45');
    });

    it('returns empty string for a falsy or non-object jump back map', () => {
      expect(resolveQuizItemJumpBack(null, 'problem-1', '1:30')).toBe('');
      expect(resolveQuizItemJumpBack(undefined, 'problem-1', '1:30')).toBe('');
    });
  });

  describe('parseJumpBackField', () => {
    it('parses per-problem JSON map', () => {
      expect(parseJumpBackField('{"problem-1":"1:29","problem-2":"1:45"}')).toEqual({
        'problem-1': '1:29',
        'problem-2': '1:45',
      });
    });

    it('parses legacy plain MM:SS string', () => {
      expect(parseJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('parses legacy time-keyed JSON map', () => {
      expect(parseJumpBackField('{"1:30":"1:29"}')).toEqual({ '1:30': '1:29' });
    });

    it('returns empty map for falsy input', () => {
      expect(parseJumpBackField('')).toEqual({});
      expect(parseJumpBackField(null)).toEqual({});
      expect(parseJumpBackField(undefined)).toEqual({});
    });

    it('returns empty map for whitespace-only input', () => {
      expect(parseJumpBackField('   ')).toEqual({});
    });

    it('normalizes a double-encoded JSON string', () => {
      expect(parseJumpBackField('"1:29"')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('returns empty map for JSON that parses to neither a string nor an object', () => {
      expect(parseJumpBackField('null')).toEqual({});
      expect(parseJumpBackField('42')).toEqual({});
    });
  });

  describe('buildTimemapFromQuizItems', () => {
    it('uses string value for single problem at a timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '' },
        { id: '2', problemId: 'problem-2', time: '2:00', jumpBack: '' },
      ]);
      expect(timemap).toEqual({
        '1:30': 'problem-1',
        '2:00': 'problem-2',
      });
    });

    it('uses array value for multiple problems at the same timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '' },
      ]);
      expect(timemap).toEqual({
        '1:30': ['problem-1', 'problem-2'],
      });
    });
  });

  describe('buildJumpBackFromQuizItems', () => {
    it('stores a jump back value per problem, even at the same timestamp', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '0:45' },
      ]);
      expect(jumpBack).toEqual({
        'problem-1': '0:30',
        'problem-2': '0:45',
      });
    });

    it('omits problems without a jump back value', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '' },
      ]);
      expect(jumpBack).toEqual({ 'problem-1': '0:30' });
    });
  });

  describe('parseStudioViewHtml', () => {
    it('parses video_id, timemap, and jump_back from studio_view HTML', () => {
      const html = `
        <input id="xb-field-edit-video_id" value="video-1" />
        <textarea id="xb-field-edit-timemap">{"1:30": "problem-1"}</textarea>
        <textarea id="xb-field-edit-jump_back">{"1:30": "1:00"}</textarea>
      `;
      expect(parseStudioViewHtml(html)).toEqual({
        videoId: 'video-1',
        timemap: { '1:30': 'problem-1' },
        jumpBack: { '1:30': '1:00' },
      });
    });

    it('returns empty timemap and logs on malformed JSON', () => {
      const html = `
        <input id="xb-field-edit-video_id" value="video-1" />
        <textarea id="xb-field-edit-timemap">not valid json</textarea>
      `;
      expect(parseStudioViewHtml(html)).toEqual({
        videoId: 'video-1',
        timemap: {},
        jumpBack: {},
      });
    });

    it('returns empty values when no fields are present', () => {
      expect(parseStudioViewHtml('<div>no fields here</div>')).toEqual({
        videoId: '',
        timemap: {},
        jumpBack: {},
      });
    });
  });
});
