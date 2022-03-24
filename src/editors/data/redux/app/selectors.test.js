// import * in order to mock in-file references
import { keyStore } from '../../../utils';
import * as urls from '../../services/cms/urls';
import * as selectors from './selectors';

jest.mock('reselect', () => ({
  createSelector: jest.fn((preSelectors, cb) => ({ preSelectors, cb })),
}));
jest.mock('../../services/cms/urls', () => ({
  unit: (args) => ({ unit: args }),
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
        simpleKeys.courseId,
        simpleKeys.editorInitialized,
        simpleKeys.saveResponse,
        simpleKeys.studioEndpointUrl,
        simpleKeys.unitUrl,
      ].map(testSimpleSelector);
    });
  });
  describe('returnUrl', () => {
    it('is memoized based on unitUrl and studioEndpointUrl', () => {
      expect(selectors.returnUrl.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.studioEndpointUrl,
      ]);
    });
    it('returns urls.unit with the unitUrl if loaded, else an empty string', () => {
      const { cb } = selectors.returnUrl;
      const studioEndpointUrl = 'baseURL';
      const unitUrl = 'some unit url';
      expect(cb(null, studioEndpointUrl)).toEqual('');
      expect(cb(unitUrl, studioEndpointUrl)).toEqual(urls.unit({ unitUrl, studioEndpointUrl }));
    });
  });
  describe('isInitialized selector', () => {
    it('is memoized based on unitUrl, editorInitialized, and blockValue', () => {
      expect(selectors.isInitialized.preSelectors).toEqual([
        simpleSelectors.unitUrl,
        simpleSelectors.editorInitialized,
        simpleSelectors.blockValue,
      ]);
    });
    it('returns true iff unitUrl, blockValue, and editorInitialized are all truthy', () => {
      const { cb } = selectors.isInitialized;
      const truthy = {
        url: { url: 'data' },
        blockValue: { block: 'value' },
        editorInitialized: true,
      };

      [
        [[truthy.url, truthy.blockValue, false], false],
        [[null, truthy.blockValue, true], false],
        [[truthy.url, null, true], false],
        [[truthy.url, truthy.blockValue, true], true],
      ].map(([args, expected]) => expect(cb(...args)).toEqual(expected));
    });
  });
  describe('typeHeader', () => {
    it('is memoized based on blockType', () => {
      expect(selectors.typeHeader.preSelectors).toEqual([simpleSelectors.blockType]);
    });
    it('returns null if blockType is null', () => {
      expect(selectors.typeHeader.cb(null)).toEqual(null);
    });
    it('returns Text if the blockType is html', () => {
      expect(selectors.typeHeader.cb('html')).toEqual('Text');
    });
    it('returns the blockType capitalized if not html', () => {
      expect(selectors.typeHeader.cb('video')).toEqual('Video');
      expect(selectors.typeHeader.cb('random')).toEqual('Random');
    });
  });
});
