import {
  buildCollectionUsageKey,
  ContainerType,
  getBlockType,
  getLibraryId,
  isContainerType,
  isContainerUsageKey,
  isLibraryKey,
  isLibraryV1Key,
  normalizeContainerType,
  parseLibraryKey,
} from './key-utils';

describe('component utils', () => {
  describe('getBlockType', () => {
    for (
      const [input, expected] of [
        ['lb:org:lib:html:id', 'html'],
        ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'html'],
        ['lb:Axim:beta:problem:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'problem'],
        ['lct:org:lib:unit:my-unit-9284e2', 'unit'],
        ['lct:org:lib:section:my-section-9284e2', 'section'],
        ['lct:org:lib:subsection:my-section-9284e2', 'subsection'],
        ['block-v1:org+type@html+block@1', 'html'],
        ['block-v1:OpenCraftX+type@html+block@1571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'html'],
        ['block-v1:Axim+type@problem+block@571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'problem'],
        ['block-v1:org+type@unit+block@1', 'unit'],
        ['block-v1:org+type@section+block@1', 'section'],
        ['block-v1:org+type@subsection+block@1', 'subsection'],
      ]
    ) {
      it(`returns '${expected}' for usage key '${input}'`, () => {
        expect(getBlockType(input)).toStrictEqual(expected);
      });
    }

    for (const input of ['', undefined, null, 'not a key', 'lb:foo', 'block-v1:foo']) {
      it(`throws an exception for usage key '${input}'`, () => {
        expect(() => getBlockType(input as any)).toThrow(`Invalid usageKey: ${input}`);
        expect(getBlockType(input as any, 'empty')).toBe('');
      });
    }
  });

  describe('getLibraryId', () => {
    for (
      const [input, expected] of [
        ['lb:org:lib:html:id', 'lib:org:lib'],
        ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'lib:OpenCraftX:ALPHA'],
        ['lb:Axim:beta:problem:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'lib:Axim:beta'],
        ['lib-collection:org:lib:coll', 'lib:org:lib'],
        ['lib-collection:OpenCraftX:ALPHA:coll', 'lib:OpenCraftX:ALPHA'],
        ['lct:org:lib:unit:my-unit-9284e2', 'lib:org:lib'],
        ['lct:OpenCraftX:ALPHA:my-unit-a3223f', 'lib:OpenCraftX:ALPHA'],
      ]
    ) {
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
    for (
      const [input, expected] of [
        ['lib:org:lib', true],
        ['lib:OpenCraftX:ALPHA', true],
        ['lb:org:lib:html:id', false],
        ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', false],
        ['library-v1:AximX+L1', false],
        ['course-v1:AximX+TS100+23', false],
        ['', false],
        [undefined, false],
      ] as const
    ) {
      it(`returns '${expected}' for learning context key '${input}'`, () => {
        expect(isLibraryKey(input)).toStrictEqual(expected);
      });
    }
  });

  describe('parseLibraryKey', () => {
    for (
      const [input, expected] of [
        ['lib:org:lib', { org: 'org', lib: 'lib' }],
        ['lib:OpenCraftX:ALPHA', { org: 'OpenCraftX', lib: 'ALPHA' }],
      ] as const
    ) {
      it(`returns '${JSON.stringify(expected)}' for learning context key '${input}'`, () => {
        expect(parseLibraryKey(input)).toStrictEqual(expected);
      });
    }

    for (
      const input of [
        '',
        undefined,
        null,
        'not a key',
        'lb:foo',
        'lb:org:lib:html:id',
      ]
    ) {
      it(`throws an exception for library key '${input}'`, () => {
        expect(() => parseLibraryKey(input as any)).toThrow(`Invalid libraryKey: ${input}`);
      });
    }
  });

  describe('isLibraryV1Key', () => {
    for (
      const [input, expected] of [
        ['library-v1:AximX+L1', true],
        ['lib:org:lib', false],
        ['lib:OpenCraftX:ALPHA', false],
        ['lb:org:lib:html:id', false],
        ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', false],
        ['course-v1:AximX+TS100+23', false],
        ['', false],
        [undefined, false],
      ] as const
    ) {
      it(`returns '${expected}' for learning context key '${input}'`, () => {
        expect(isLibraryV1Key(input)).toStrictEqual(expected);
      });
    }
  });

  describe('buildCollectionUsageKey', () => {
    for (
      const [libraryKey, collectionId, expected] of [
        ['lib:org:lib', 'coll', 'lib-collection:org:lib:coll'],
        ['lib:OpenCraftX:ALPHA', 'coll', 'lib-collection:OpenCraftX:ALPHA:coll'],
        ['lb:org:lib:html:id', 'coll', ''],
        ['lb:OpenCraftX:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd', 'coll', ''],
        ['library-v1:AximX+L1', 'coll', ''],
        ['course-v1:AximX+TS100+23', 'coll', ''],
        ['', 'coll', ''],
        ['', 'coll', ''],
      ] as const
    ) {
      it(`returns '${expected}' for learning context key '${libraryKey}' and collection Id '${collectionId}'`, () => {
        expect(buildCollectionUsageKey(libraryKey, collectionId)).toStrictEqual(expected);
      });
    }
  });

  describe('normalizeContainerType', () => {
    for (
      const [containerType, expected] of [
        [ContainerType.Vertical, ContainerType.Unit],
        [ContainerType.Sequential, ContainerType.Subsection],
        [ContainerType.Chapter, ContainerType.Section],
        [ContainerType.Unit, ContainerType.Unit],
        [ContainerType.Section, ContainerType.Section],
        [ContainerType.Subsection, ContainerType.Subsection],
      ] as const
    ) {
      it(`returns '${expected}' for '${containerType}'`, () => {
        expect(normalizeContainerType(containerType)).toStrictEqual(expected);
      });
    }
  });

  describe('isContainerType', () => {
    for (
      const containerType of [
        ContainerType.Vertical,
        ContainerType.Sequential,
        ContainerType.Chapter,
        ContainerType.Unit,
        ContainerType.Subsection,
        ContainerType.Section,
      ] as const
    ) {
      it(`returns true for '${containerType}'`, () => {
        expect(isContainerType(containerType)).toBe(true);
      });
    }

    for (const containerType of ['html', 'problem', '', 'video']) {
      it(`returns false for '${containerType}'`, () => {
        expect(isContainerType(containerType)).toBe(false);
      });
    }
  });

  describe('isContainerUsageKey', () => {
    for (
      const usageKey of [
        'lct:org:lib:section:my-section-9284e2',
        'lct:org:lib:subsection:my-subsection-9284e2',
        'lct:org:lib:unit:my-unit-9284e2',
        'block-v1:org+type@chapter+block@1',
        'block-v1:org+type@sequential+block@1',
        'block-v1:org+type@vertical+block@1',
        'block-v1:org+type@section+block@1',
        'block-v1:org+type@subsection+block@1',
        'block-v1:org+type@unit+block@1',
      ]
    ) {
      it(`returns true for '${usageKey}'`, () => {
        expect(isContainerUsageKey(usageKey)).toBe(true);
      });
    }

    for (
      const usageKey of [
        'lb:org:lib:html:id',
        'block-v1:org+type@problem+block@1',
        'not a key',
        '',
        undefined,
        null,
      ]
    ) {
      it(`returns false for '${usageKey}'`, () => {
        expect(isContainerUsageKey(usageKey as any)).toBe(false);
      });
    }
  });
});
