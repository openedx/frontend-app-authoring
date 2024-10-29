// import * in order to mock in-file references
import { keyStore } from '../../../utils';
import * as urls from '../../services/cms/urls';
import * as selectors from './selectors';

jest.mock('reselect', () => ({
  createSelector: jest.fn((preSelectors, cb) => ({ preSelectors, cb })),
}));
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
      expect(appSelector({ ...testState, app: testValue })).toEqual(testValue);
    });
  });
  describe('simpleSelectors', () => {
    const testSimpleSelector = (key) => {
      test(`${key} simpleSelector returns its value from the app store`, () => {
        const { preSelectors, cb } = simpleSelectors[key];
        expect(preSelectors).toEqual([appSelector]);
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
      expect(selectors.returnUrl.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.studioEndpointUrl,
        simpleSelectors.learningContextId,
        simpleSelectors.blockId,
      ]);
    });
    it('returns urls.returnUrl with the returnUrl', () => {
      const { cb } = selectors.returnUrl;
      const studioEndpointUrl = 'baseURL';
      const unitUrl = 'some unit url';
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
      expect(selectors.isInitialized.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.blockValue,
        selectors.isLibrary,
      ]);
    });
    describe('for library blocks', () => {
      it('returns true if blockValue, and editorInitialized are truthy', () => {
        const { cb } = selectors.isInitialized;
        const truthy = {
          blockValue: { block: 'value' },
        };

        [
          [[null, truthy.blockValue, true], true],
          [[null, null, true], false],
        ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
      });
    });
    describe('for course blocks', () => {
      it('returns true if blockValue, unitUrl, and editorInitialized are truthy', () => {
        const { cb } = selectors.isInitialized;
        const truthy = {
          blockValue: { block: 'value' },
          unitUrl: { url: 'data' },
        };

        [
          [[null, truthy.blockValue, false], false],
          [[truthy.unitUrl, null, false], false],
          [[truthy.unitUrl, truthy.blockValue, false], true],
        ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
      });
    });
  });
  describe('displayTitle', () => {
    const title = 'tItLe';
    it('is memoized based on blockType and blockTitle', () => {
      expect(selectors.displayTitle.preSelectors).toEqual([
        simpleSelectors.blockType,
        simpleSelectors.blockTitle,
      ]);
    });
    it('returns null if blockType is null', () => {
      expect(selectors.displayTitle.cb(null, title)).toEqual(null);
    });
    it('returns blockTitle if blockTitle is not null', () => {
      expect(selectors.displayTitle.cb('html', title)).toEqual(title);
    });
    it('returns Text if the blockType is html', () => {
      expect(selectors.displayTitle.cb('html', null)).toEqual('Text');
    });
    it('returns the blockType capitalized if not html', () => {
      expect(selectors.displayTitle.cb('video', null)).toEqual('Video');
      expect(selectors.displayTitle.cb('random', null)).toEqual('Random');
    });
  });

  describe('isLibrary', () => {
    const learningContextIdLibrary = 'library-v1:name';
    const learningContextIdCourse = 'course-v1:name';
    it('is memoized based on isLibrary', () => {
      expect(selectors.isLibrary.preSelectors).toEqual([
        simpleSelectors.learningContextId,
        simpleSelectors.blockId,
      ]);
    });
    describe('blockId is null', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.cb(null, null)).toEqual(false);
      });
      it('should return false when learningContextId defined', () => {
        expect(selectors.isLibrary.cb(learningContextIdCourse, null)).toEqual(false);
      });
    });
    describe('blockId is a course block', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.cb(null, 'block-v1:')).toEqual(false);
      });
      it('should return false when learningContextId defined', () => {
        expect(selectors.isLibrary.cb(learningContextIdCourse, 'block-v1:')).toEqual(false);
      });
    });
    describe('blockId is a v2 library block', () => {
      it('should return true when learningContextId null', () => {
        expect(selectors.isLibrary.cb(null, 'lb:')).toEqual(true);
      });
      it('should return false when learningContextId is a v1 library', () => {
        expect(selectors.isLibrary.cb(learningContextIdLibrary, 'lb:')).toEqual(true);
      });
    });
    describe('blockId is a v1 library block', () => {
      it('should return false when learningContextId null', () => {
        expect(selectors.isLibrary.cb(null, 'library-v1')).toEqual(false);
      });
      it('should return true when learningContextId a v1 library', () => {
        expect(selectors.isLibrary.cb(learningContextIdLibrary, 'library-v1')).toEqual(true);
      });
    });
  });
});
