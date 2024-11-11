import { keyStore, parseLibraryImageData, getLibraryImageAssets } from '../../../utils';
import { RequestKeys } from '../../constants/requests';
import api from '../../services/cms/api';
import * as requests from './requests';
import { actions, selectors } from '../index';

const testState = {
  some: 'data',
};

jest.mock('../app/selectors', () => ({
  simpleSelectors: {
    studioEndpointUrl: (state) => ({ studioEndpointUrl: state }),
    blockId: (state) => ({ blockId: state }),
  },
  studioEndpointUrl: (state) => ({ studioEndpointUrl: state }),
  blockId: (state) => ({ blockId: state }),
  blockType: (state) => ({ blockType: state }),
  learningContextId: (state) => ({ learningContextId: state }),
  blockTitle: (state) => ({ title: state }),
}));

jest.mock('../../services/cms/api', () => ({
  fetchBlockById: ({ id, url }) => ({ id, url }),
  fetchStudioView: ({ id, url }) => ({ id, url }),
  fetchByUnitId: ({ id, url }) => ({ id, url }),
  fetchCourseDetails: (args) => args,
  saveBlock: (args) => args,
  fetchCourseImages: ({ id, url }) => ({ id, url }),
  fetchLibraryImages: ({ id, url }) => ({ id, url }),
  fetchVideos: ({ id, url }) => ({ id, url }),
  uploadAsset: (args) => args,
  loadImages: jest.fn(),
  uploadThumbnail: (args) => args,
  uploadTranscript: (args) => args,
  deleteTranscript: (args) => args,
  getTranscript: (args) => args,
  checkTranscriptsForImport: (args) => args,
  importTranscript: (args) => args,
  fetchVideoFeatures: (args) => args,
  uploadVideo: (args) => args,
}));

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  parseLibraryImageData: jest.fn(),
  getLibraryImageAssets: jest.fn(() => ({})),
}));

const apiKeys = keyStore(api);

let dispatch;
let onSuccess;
let onFailure;

const fetchParams = { fetchParam1: 'param1', fetchParam2: 'param2' };

describe('requests thunkActions module', () => {
  beforeEach(() => {
    dispatch = jest.fn();
    onSuccess = jest.fn();
    onFailure = jest.fn();
  });

  describe('networkRequest', () => {
    const requestKey = 'test-request';
    const testData = ({ some: 'test data' });
    let resolveFn;
    let rejectFn;
    describe('without success and failure handlers', () => {
      beforeEach(() => {
        requests.networkRequest({
          requestKey,
          promise: new Promise((resolve, reject) => {
            resolveFn = resolve;
            rejectFn = reject;
          }),
        })(dispatch);
      });
      test('calls startRequest action with requestKey', async () => {
        expect(dispatch.mock.calls).toEqual([[actions.requests.startRequest(requestKey)]]);
      });
      describe('on success', () => {
        beforeEach(async () => {
          await resolveFn(testData);
        });
        it('dispatches completeRequest', async () => {
          expect(dispatch.mock.calls).toEqual([
            [actions.requests.startRequest(requestKey)],
            [actions.requests.completeRequest({ requestKey, response: testData })],
          ]);
        });
      });
      describe('on failure', () => {
        beforeEach(async () => {
          await rejectFn(testData);
        });
        test('dispatches completeRequest', async () => {
          expect(dispatch.mock.calls).toEqual([
            [actions.requests.startRequest(requestKey)],
            [actions.requests.failRequest({ requestKey, error: testData })],
          ]);
        });
      });
    });
    describe('with handlers', () => {
      beforeEach(() => {
        onSuccess = jest.fn();
        onFailure = jest.fn();
        requests.networkRequest({
          requestKey,
          promise: new Promise((resolve, reject) => {
            resolveFn = resolve;
            rejectFn = reject;
          }),
          onSuccess,
          onFailure,
        })(dispatch);
      });
      test('calls startRequest action with requestKey', async () => {
        expect(dispatch.mock.calls).toEqual([[actions.requests.startRequest(requestKey)]]);
      });
      describe('on success', () => {
        beforeEach(async () => {
          await resolveFn(testData);
        });
        it('dispatches completeRequest', async () => {
          expect(dispatch.mock.calls).toEqual([
            [actions.requests.startRequest(requestKey)],
            [actions.requests.completeRequest({ requestKey, response: testData })],
          ]);
        });
        it('calls onSuccess with response', async () => {
          expect(onSuccess).toHaveBeenCalledWith(testData);
          expect(onFailure).not.toHaveBeenCalled();
        });
      });
      describe('on failure', () => {
        beforeEach(async () => {
          await rejectFn(testData);
        });
        test('dispatches completeRequest', async () => {
          expect(dispatch.mock.calls).toEqual([
            [actions.requests.startRequest(requestKey)],
            [actions.requests.failRequest({ requestKey, error: testData })],
          ]);
        });
        test('calls onFailure with response', async () => {
          expect(onFailure).toHaveBeenCalledWith(testData);
          expect(onSuccess).not.toHaveBeenCalled();
        });
      });
    });
  });

  const testNetworkRequestAction = ({
    action,
    args,
    expectedData,
    expectedString,
  }) => {
    let dispatchedAction;
    beforeEach(() => {
      action({ ...args, onSuccess, onFailure })(dispatch, () => testState);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches networkRequest', () => {
      expect(dispatchedAction.networkRequest).not.toEqual(undefined);
    });
    test('forwards onSuccess and onFailure', () => {
      expect(dispatchedAction.networkRequest.onSuccess).toEqual(onSuccess);
      expect(dispatchedAction.networkRequest.onFailure).toEqual(onFailure);
    });
    test(expectedString, () => {
      expect(dispatchedAction.networkRequest).toEqual({
        ...expectedData,
        onSuccess,
        onFailure,
      });
    });
  };
  describe('network request actions', () => {
    beforeEach(() => {
      // eslint-disable-next-line no-import-assign
      requests.networkRequest = jest.fn(args => ({ networkRequest: args }));
    });
    describe('fetchBlock', () => {
      testNetworkRequestAction({
        action: requests.fetchBlock,
        args: fetchParams,
        expectedString: 'with fetchBlock promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.fetchBlock,
          promise: api.fetchBlockById({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            blockId: selectors.app.blockId(testState),
          }),
        },
      });
    });
    describe('fetchUnit', () => {
      testNetworkRequestAction({
        action: requests.fetchUnit,
        args: fetchParams,
        expectedString: 'with fetchUnit promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.fetchUnit,
          promise: api.fetchByUnitId({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            blockId: selectors.app.blockId(testState),
          }),
        },
      });
    });
    describe('fetchStudioView', () => {
      testNetworkRequestAction({
        action: requests.fetchStudioView,
        args: fetchParams,
        expectedString: 'with fetchStudioView promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.fetchStudioView,
          promise: api.fetchStudioView({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            blockId: selectors.app.blockId(testState),
          }),
        },
      });
    });
    describe('fetchCourseDetails', () => {
      testNetworkRequestAction({
        action: requests.fetchCourseDetails,
        args: fetchParams,
        expectedString: 'with fetchCourseDetails promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.fetchCourseDetails,
          promise: api.fetchCourseDetails({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            learningContextId: selectors.app.learningContextId(testState),
          }),
        },
      });
    });
    describe('fetchImages', () => {
      let fetchImages;
      let loadImages;
      let dispatchedAction;
      describe('courses', () => {
        beforeEach(() => {
          fetchImages = jest.fn((args) => new Promise((resolve) => {
            resolve({ data: { assets: { fetchImages: args } } });
          }));
          jest.spyOn(api, apiKeys.fetchCourseImages).mockImplementationOnce(fetchImages);
          loadImages = jest.spyOn(api, apiKeys.loadImages).mockImplementationOnce(() => ({}));
          requests.fetchImages({ ...fetchParams, onSuccess, onFailure })(dispatch, () => testState);
          [[dispatchedAction]] = dispatch.mock.calls;
        });
        const expectedArgs = {
          blockId: selectors.app.blockId(testState),
          studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          learningContextId: selectors.app.learningContextId(testState),
        };
        it('dispatches networkRequest', () => {
          expect(dispatchedAction.networkRequest).not.toEqual(undefined);
        });
        test('forwards onSuccess and onFailure', () => {
          expect(dispatchedAction.networkRequest.onSuccess).toEqual(onSuccess);
          expect(dispatchedAction.networkRequest.onFailure).toEqual(onFailure);
        });
        test('api.fetchImages promise called with studioEndpointUrl and learningContextId', () => {
          expect(fetchImages).toHaveBeenCalledWith(expectedArgs);
        });
        test('promise is chained with api.loadImages', () => {
          expect(loadImages).toHaveBeenCalledWith({ fetchImages: expectedArgs });
        });
        test('promise is chained with api.loadImages', () => {
          expect(loadImages).toHaveBeenCalledWith({ fetchImages: expectedArgs });
        });
      });
      describe('libraries', () => {
        const expectedArgs = {
          learningContextId: 'lib:demo',
          studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          blockId: selectors.app.blockId(testState),
        };
        beforeEach(() => {
          jest.spyOn(selectors.app, 'learningContextId').mockImplementationOnce(() => ('lib:demo'));
          fetchImages = jest.fn((args) => new Promise((resolve) => {
            resolve({ data: { files: { fetchImages: args } } });
          }));
          jest.spyOn(api, apiKeys.fetchLibraryImages).mockImplementationOnce(fetchImages);
          requests.fetchImages({
            ...fetchParams, onSuccess, onFailure,
          })(dispatch, () => testState);
          [[dispatchedAction]] = dispatch.mock.calls;
        });
        test('api.fetchImages promise called with studioEndpointUrl and blockId', () => {
          expect(fetchImages).toHaveBeenCalledWith(expectedArgs);
          expect(getLibraryImageAssets).toHaveBeenCalled();
        });
      });
    });
    describe('fetchVideos', () => {
      const expectedArgs = {
        studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
        learningContextId: selectors.app.learningContextId(testState),
      };
      let fetchVideos;
      let dispatchedAction;
      beforeEach(() => {
        fetchVideos = jest.fn((args) => new Promise((resolve) => {
          resolve({ data: { videos: { fetchVideos: args } } });
        }));
        jest.spyOn(api, apiKeys.fetchVideos).mockImplementationOnce(fetchVideos);
        requests.fetchVideos({ ...fetchParams, onSuccess, onFailure })(dispatch, () => testState);
        [[dispatchedAction]] = dispatch.mock.calls;
      });
      it('dispatches networkRequest', () => {
        expect(dispatchedAction.networkRequest).not.toEqual(undefined);
      });
      test('forwards onSuccess and onFailure', () => {
        expect(dispatchedAction.networkRequest.onSuccess).toEqual(onSuccess);
        expect(dispatchedAction.networkRequest.onFailure).toEqual(onFailure);
      });
      test('api.fetchVideos promise called with studioEndpointUrl and learningContextId', () => {
        expect(fetchVideos).toHaveBeenCalledWith(expectedArgs);
      });
    });
    describe('saveBlock', () => {
      const content = 'SoME HtMl CoNtent As String';
      testNetworkRequestAction({
        action: requests.saveBlock,
        args: { content, ...fetchParams },
        expectedString: 'with saveBlock promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.saveBlock,
          promise: api.saveBlock({
            blockId: selectors.app.blockId(testState),
            blockType: selectors.app.blockType(testState),
            learningContextId: selectors.app.learningContextId(testState),
            content,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            title: selectors.app.blockTitle(testState),
          }),
        },
      });
    });
    describe('uploadAsset', () => {
      const asset = 'SoME iMage CoNtent As String';
      let uploadAsset;
      let dispatchedAction;

      describe('courses', () => {
        const expectedArgs = {
          learningContextId: selectors.app.learningContextId(testState),
          studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          blockId: selectors.app.blockId(testState),
          asset,
        };
        beforeEach(() => {
          uploadAsset = jest.fn((args) => new Promise((resolve) => {
            resolve({ data: { asset: args } });
          }));
          jest.spyOn(api, apiKeys.uploadAsset).mockImplementationOnce(uploadAsset);
          requests.uploadAsset({
            asset, ...fetchParams, onSuccess, onFailure,
          })(dispatch, () => testState);
          [[dispatchedAction]] = dispatch.mock.calls;
        });
        it('dispatches networkRequest', () => {
          expect(dispatchedAction.networkRequest).not.toEqual(undefined);
        });
        test('forwards onSuccess and onFailure', () => {
          expect(dispatchedAction.networkRequest.onSuccess).toEqual(onSuccess);
          expect(dispatchedAction.networkRequest.onFailure).toEqual(onFailure);
        });
        test('api.uploadAsset promise called with studioEndpointUrl, blockId and learningContextId', () => {
          expect(uploadAsset).toHaveBeenCalledWith(expectedArgs);
        });
      });
      describe('libraries', () => {
        const expectedArgs = {
          learningContextId: 'lib:demo',
          studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          blockId: selectors.app.blockId(testState),
          asset,
        };
        beforeEach(() => {
          jest.spyOn(selectors.app, 'learningContextId').mockImplementationOnce(() => ('lib:demo'));
          uploadAsset = jest.fn((args) => new Promise((resolve) => {
            resolve({ data: { asset: args } });
          }));
          jest.spyOn(api, apiKeys.uploadAsset).mockImplementationOnce(uploadAsset);
          requests.uploadAsset({
            asset, ...fetchParams, onSuccess, onFailure,
          })(dispatch, () => testState);
          [[dispatchedAction]] = dispatch.mock.calls;
        });
        test('api.uploadAsset promise called with studioEndpointUrl and blockId', () => {
          expect(uploadAsset).toHaveBeenCalledWith(expectedArgs);
          expect(parseLibraryImageData).toHaveBeenCalled();
        });
      });
    });

    describe('uploadThumbnail', () => {
      const thumbnail = 'SoME tHumbNAil CoNtent As String';
      const videoId = 'SoME VidEOid CoNtent As String';
      testNetworkRequestAction({
        action: requests.uploadThumbnail,
        args: { thumbnail, videoId, ...fetchParams },
        expectedString: 'with uploadThumbnail promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.uploadThumbnail,
          promise: api.uploadThumbnail({
            learningContextId: selectors.app.learningContextId(testState),
            thumbnail,
            videoId,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('deleteTranscript', () => {
      const language = 'SoME laNGUage CoNtent As String';
      const videoId = 'SoME VidEOid CoNtent As String';
      testNetworkRequestAction({
        action: requests.deleteTranscript,
        args: { language, videoId, ...fetchParams },
        expectedString: 'with deleteTranscript promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.deleteTranscript,
          promise: api.deleteTranscript({
            blockId: selectors.app.blockId(testState),
            language,
            videoId,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('checkTranscriptsForImport', () => {
      const youTubeId = 'SoME yOUtUbEiD As String';
      const videoId = 'SoME VidEOid As String';
      testNetworkRequestAction({
        action: requests.checkTranscriptsForImport,
        args: { youTubeId, videoId, ...fetchParams },
        expectedString: 'with checkTranscriptsForImport promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.checkTranscriptsForImport,
          promise: api.checkTranscriptsForImport({
            blockId: selectors.app.blockId(testState),
            youTubeId,
            videoId,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('importTranscript', () => {
      const youTubeId = 'SoME yOUtUbEiD As String';
      testNetworkRequestAction({
        action: requests.importTranscript,
        args: { youTubeId, ...fetchParams },
        expectedString: 'with importTranscript promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.importTranscript,
          promise: api.importTranscript({
            blockId: selectors.app.blockId(testState),
            youTubeId,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('getTranscriptFile', () => {
      const language = 'SoME laNGUage CoNtent As String';
      const videoId = 'SoME VidEOid CoNtent As String';
      testNetworkRequestAction({
        action: requests.getTranscriptFile,
        args: { language, videoId, ...fetchParams },
        expectedString: 'with getTranscriptFile promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.getTranscriptFile,
          promise: api.getTranscript({
            blockId: selectors.app.blockId(testState),
            language,
            videoId,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('updateTranscriptLanguage', () => {
      const languageBeforeChange = 'SoME laNGUage CoNtent As String';
      const newLanguageCode = 'SoME NEW laNGUage CoNtent As String';
      const videoId = 'SoME VidEOid CoNtent As String';
      testNetworkRequestAction({
        action: requests.updateTranscriptLanguage,
        args: {
          languageBeforeChange,
          newLanguageCode,
          videoId,
          ...fetchParams,
        },
        expectedString: 'with uploadTranscript promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.updateTranscriptLanguage,
          promise: api.uploadTranscript({
            blockId: selectors.app.blockId(testState),
            videoId,
            language: languageBeforeChange,
            newLanguage: newLanguageCode,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });

    describe('uploadTranscript', () => {
      const language = 'SoME laNGUage CoNtent As String';
      const videoId = 'SoME VidEOid CoNtent As String';
      const transcript = 'SoME tRANscRIPt CoNtent As String';
      testNetworkRequestAction({
        action: requests.uploadTranscript,
        args: {
          transcript,
          language,
          videoId,
          ...fetchParams,
        },
        expectedString: 'with uploadTranscript promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.uploadTranscript,
          promise: api.uploadTranscript({
            blockId: selectors.app.blockId(testState),
            transcript,
            videoId,
            language,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('fetchVideoFeatures', () => {
      testNetworkRequestAction({
        action: requests.fetchVideoFeatures,
        args: { ...fetchParams },
        expectedString: 'with fetchVideoFeatures promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.fetchVideoFeatures,
          promise: api.fetchVideoFeatures({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
    describe('uploadVideo', () => {
      const data = { files: [{ file_name: 'video.mp4', content_type: 'mp4' }] };
      testNetworkRequestAction({
        action: requests.uploadVideo,
        args: { ...fetchParams, data },
        expectedString: 'with uploadVideo promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.uploadVideo,
          promise: api.uploadVideo({
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            learningContextId: selectors.app.learningContextId(testState),
            data,
          }),
        },
      });
    });
  });
});
