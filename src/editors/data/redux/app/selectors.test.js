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
        simpleKeys.assets,
        simpleKeys.videos,
      ].map(testSimpleSelector);
    });
  });
  describe('returnUrl', () => {
    it('is memoized based on unitUrl and studioEndpointUrl', () => {
      expect(selectors.returnUrl.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.studioEndpointUrl,
        simpleSelectors.learningContextId,
      ]);
    });
    it('returns urls.returnUrl with the returnUrl', () => {
      const { cb } = selectors.returnUrl;
      const studioEndpointUrl = 'baseURL';
      const unitUrl = 'some unit url';
      const learningContextId = 'some learning context';
      expect(
        cb(unitUrl, studioEndpointUrl, learningContextId),
      ).toEqual(
        urls.returnUrl({ unitUrl, studioEndpointUrl, learningContextId }),
      );
    });
  });
  describe('isInitialized selector', () => {
    it('is memoized based on unitUrl, editorInitialized, and blockValue', () => {
      expect(selectors.isInitialized.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.blockValue,
      ]);
    });
    it('returns true iff unitUrl, blockValue, and editorInitialized are all truthy', () => {
      const { cb } = selectors.isInitialized;
      const truthy = {
        url: { url: 'data' },
        blockValue: { block: 'value' },
      };

      [
        [[null, truthy.blockValue], false],
        [[truthy.url, null], false],
        [[truthy.url, truthy.blockValue], true],
      ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
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

  describe('isRaw', () => {
    const studioViewRaw = {
      data: {
        html: 'data-editor="raw"',
      },
    };
    const studioViewVisual = {
      data: {
        html: 'sOmEthIngElse',
      },
    };
    it('is memoized based on studioView', () => {
      expect(selectors.isRaw.preSelectors).toEqual([
        simpleSelectors.studioView,
      ]);
    });
    it('returns null if studioView is null', () => {
      expect(selectors.isRaw.cb(null)).toEqual(null);
    });
    it('returns true if studioView is raw', () => {
      expect(selectors.isRaw.cb(studioViewRaw)).toEqual(true);
    });
    it('returns false if the studioView is not Raw', () => {
      expect(selectors.isRaw.cb(studioViewVisual)).toEqual(false);
    });
  });

  describe('isLibrary', () => {
    const learningContextIdLibrary = 'library-v1:name';
    const learningContextIdCourse = 'course-v1:name';
    it('is memoized based on studioView', () => {
      expect(selectors.isLibrary.preSelectors).toEqual([
        simpleSelectors.learningContextId,
      ]);
    });
    it('returns null if blockId is null', () => {
      expect(selectors.isLibrary.cb(null)).toEqual(null);
    });
    it('returns true if blockId starts with lib', () => {
      expect(selectors.isLibrary.cb(learningContextIdLibrary)).toEqual(true);
    });
    it('returns false if the blockId does not start with lib', () => {
      expect(selectors.isLibrary.cb(learningContextIdCourse)).toEqual(false);
    });
  });
});
