import {
  getBlockType,
  getLibraryId,
  isLibraryKey,
  isLibraryV1Key,
} from './key-utils';

describe('component utils', () => {
  describe('getBlockType', () => {
    for (const [input, expected] of [
      ['lb:org:lib:html:id', 'html'],
      ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'html'],
      ['lb:Axim:beta:problem:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'problem'],
    ]) {
      it(`returns '${expected}' for usage key '${input}'`, () => {
        expect(getBlockType(input)).toStrictEqual(expected);
      });
    }

    for (const input of ['', undefined, null, 'not a key', 'lb:foo']) {
      it(`throws an exception for usage key '${input}'`, () => {
        expect(() => getBlockType(input as any)).toThrow(`Invalid usageKey: ${input}`);
      });
    }
  });

  describe('getLibraryId', () => {
    for (const [input, expected] of [
      ['lb:org:lib:html:id', 'lib:org:lib'],
      ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'lib:OpenCraftX:ALPHA'],
      ['lb:Axim:beta:problem:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'lib:Axim:beta'],
    ]) {
      it(`returns '${expected}' for usage key '${input}'`, () => {
        expect(getLibraryId(input)).toStrictEqual(expected);
      });
    }

    for (const input of ['', undefined, null, 'not a key', 'lb:foo']) {
      it(`throws an exception for usage key '${input}'`, () => {
        expect(() => getLibraryId(input as any)).toThrow(`Invalid usageKey: ${input}`);
      });
    }
  });

  describe('isLibraryKey', () => {
    for (const [input, expected] of [
      ['lib:org:lib', true],
      ['lib:OpenCraftX:ALPHA', true],
      ['lb:org:lib:html:id', false],
      ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', false],
      ['library-v1:AximX+L1', false],
      ['course-v1:AximX+TS100+23', false],
      ['', false],
      [undefined, false],
    ] as const) {
      it(`returns '${expected}' for learning context key '${input}'`, () => {
        expect(isLibraryKey(input)).toStrictEqual(expected);
      });
    }
  });

  describe('isLibraryV1Key', () => {
    for (const [input, expected] of [
      ['library-v1:AximX+L1', true],
      ['lib:org:lib', false],
      ['lib:OpenCraftX:ALPHA', false],
      ['lb:org:lib:html:id', false],
      ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', false],
      ['course-v1:AximX+TS100+23', false],
      ['', false],
      [undefined, false],
    ] as const) {
      it(`returns '${expected}' for learning context key '${input}'`, () => {
        expect(isLibraryV1Key(input)).toStrictEqual(expected);
      });
    }
  });
});
