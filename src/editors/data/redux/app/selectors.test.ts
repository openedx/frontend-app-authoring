import type { EditorState } from '..';
import { keyStore } from '../../../utils';
// import * in order to mock in-file references
import * as urls from '../../services/cms/urls';
import * as selectors from './selectors';

jest.mock('../../services/cms/urls', () => ({
  returnUrl: (args) => ({ returnUrl: args }),
}));

const testState = { some: 'arbitraryValue' };
const testValue = 'my VALUE';

describe('app selectors unit tests', () => {
  const {
    appSelector,
    simpleSelectors,
  } = selectors;
  describe('appSelector', () => {
    it('returns the app data', () => {
      expect(appSelector({ ...testState, app: testValue } as any as EditorState)).toEqual(testValue);
    });
  });
  describe('simpleSelectors', () => {
    const testSimpleSelector = (key) => {
      test(`${key} simpleSelector returns its value from the app store`, () => {
        const { dependencies, resultFunc: cb } = simpleSelectors[key];
        expect(dependencies).toEqual([appSelector]);
        expect(cb({ ...testState, [key]: testValue })).toEqual(testValue);
      });
    };
    const simpleKeys = keyStore(simpleSelectors);
    describe('simple selectors link their values from app store', () => {
      [
        simpleKeys.blockContent,
        simpleKeys.blockId,
        simpleKeys.blockTitle,
        simpleKeys.blockType,
        simpleKeys.blockValue,
        simpleKeys.learningContextId,
        simpleKeys.editorInitialized,
        simpleKeys.saveResponse,
        simpleKeys.lmsEndpointUrl,
        simpleKeys.studioEndpointUrl,
        simpleKeys.unitUrl,
        simpleKeys.blockTitle,
        simpleKeys.studioView,
        simpleKeys.images,
        simpleKeys.videos,
        simpleKeys.showRawEditor,
      ].map(testSimpleSelector);
    });
  });
  describe('returnUrl', () => {
    it('is memoized based on unitUrl and studioEndpointUrl', () => {
      expect(selectors.returnUrl.dependencies).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.studioEndpointUrl,
        simpleSelectors.learningContextId,
        simpleSelectors.blockId,
      ]);
    });
    it('returns urls.returnUrl with the returnUrl', () => {
      const { resultFunc: cb } = selectors.returnUrl;
      const studioEndpointUrl = 'baseURL';
      const unitUrl = {
        data: {
          ancestors: [
            {
              id: 'unit id', display_name: 'Unit', category: 'vertical' as const, has_children: true,
            }],
        },
      };
      const learningContextId = 'some learning context';
      const blockId = 'block-v1 some v1 block id';
      expect(
        cb(unitUrl, studioEndpointUrl, learningContextId, blockId),
      ).toEqual(
        urls.returnUrl({
          unitUrl, studioEndpointUrl, learningContextId, blockId,
        }),
      );
    });
  });
  describe('isInitialized selector', () => {
    it('is memoized based on editorInitialized, unitUrl, isLibrary and blockValue', () => {
      expect(selectors.isInitialized.dependencies).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.blockValue,
        selectors.isLibrary,
      ]);
    });
    describe('for library blocks', () => {
      it('returns true if blockValue, and editorInitialized are truthy', () => {
        const { resultFunc: cb } = selectors.isInitialized;
        const truthy = {
          blockValue: { block: 'value' },
        };

        [
          [[null, truthy.blockValue, true] as [any, any, any], true] as const,
          [[null, null, true] as [any, any, any], false] as const,
        ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
      });
    });
    describe('for course blocks', () => {
      it('returns true if blockValue, unitUrl, and editorInitialized are truthy', () => {
        const { resultFunc: cb } = selectors.isInitialized;
        const truthy = {
          blockValue: { block: 'value' },
          unitUrl: { url: 'data' },
        };

        [
          [[null, truthy.blockValue, false] as [any, any, any], false] as const,
          [[truthy.unitUrl, null, false] as [any, any, any], false] as const,
          [[truthy.unitUrl, truthy.blockValue, false] as [any, any, any], true] as const,
        ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
      });
    });
  });
  describe('displayTitle', () => {
    const title = 'tItLe';
    it('is memoized based on blockType and blockTitle', () => {
      expect(selectors.displayTitle.dependencies).toEqual([
        simpleSelectors.blockType,
        simpleSelectors.blockTitle,
      ]);
    });
    it('returns null if blockType is null', () => {
      expect(selectors.displayTitle.resultFunc(null, title)).toEqual(null);
    });
    it('returns blockTitle if blockTitle is not null', () => {
      expect(selectors.displayTitle.resultFunc('html', title)).toEqual(title);
    });
    it('returns Text if the blockType is html', () => {
      expect(selectors.displayTitle.resultFunc('html', null)).toEqual('Text');
    });
    it('returns the blockType capitalized if not html', () => {
      expect(selectors.displayTitle.resultFunc('video', null)).toEqual('Video');
      expect(selectors.displayTitle.resultFunc('random', null)).toEqual('Random');
    });
  });

  describe('isLibrary', () => {
    const learningContextIdLibrary = 'library-v1:name';
    const learningContextIdCourse = 'course-v1:name';
    it('is memoized based on isLibrary', () => {
      expect(selectors.isLibrary.dependencies).toEqual([
        simpleSelectors.learningContextId,
        simpleSelectors.blockId,
      ]);
    });
    describe('blockId is null', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.resultFunc(null, null)).toEqual(false);
      });
      it('should return false when learningContextId defined', () => {
        expect(selectors.isLibrary.resultFunc(learningContextIdCourse, null)).toEqual(false);
      });
    });
    describe('blockId is a course block', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.resultFunc(null, 'block-v1:')).toEqual(false);
      });
      it('should return false when learningContextId defined', () => {
        expect(selectors.isLibrary.resultFunc(learningContextIdCourse, 'block-v1:')).toEqual(false);
      });
    });
    describe('blockId is a v2 library block', () => {
      it('should return true when learningContextId null', () => {
        expect(selectors.isLibrary.resultFunc(null, 'lb:')).toEqual(true);
      });
      it('should return false when learningContextId is a v1 library', () => {
        expect(selectors.isLibrary.resultFunc(learningContextIdLibrary, 'lb:')).toEqual(true);
      });
    });
    describe('blockId is a v1 library block', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.resultFunc(null, 'library-v1')).toEqual(false);
      });
      it('should return true when learningContextId a v1 library', () => {
        expect(selectors.isLibrary.resultFunc(learningContextIdLibrary, 'library-v1')).toEqual(true);
      });
    });
  });
});
