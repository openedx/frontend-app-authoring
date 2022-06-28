import { keyStore } from '../../../utils';
import { RequestKeys } from '../../constants/requests';
import api from '../../services/cms/api';
import * as requests from './requests';
import { actions, selectors } from '../index';

const testState = {
  some: 'data',
};

jest.mock('../app/selectors', () => ({
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
  saveBlock: (args) => args,
  fetchImages: ({ id, url }) => ({ id, url }),
  uploadImage: (args) => args,
  loadImages: jest.fn(),
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

    describe('fetchImages', () => {
      let fetchImages;
      let loadImages;
      let dispatchedAction;
      const expectedArgs = {
        studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
        learningContextId: selectors.app.learningContextId(testState),
      };
      beforeEach(() => {
        fetchImages = jest.fn((args) => new Promise((resolve) => {
          resolve({ data: { assets: { fetchImages: args } } });
        }));
        jest.spyOn(api, apiKeys.fetchImages).mockImplementationOnce(fetchImages);
        loadImages = jest.spyOn(api, apiKeys.loadImages).mockImplementationOnce(() => ({}));
        requests.fetchImages({ ...fetchParams, onSuccess, onFailure })(dispatch, () => testState);
        [[dispatchedAction]] = dispatch.mock.calls;
      });
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

    describe('uploadImage', () => {
      const image = 'SoME iMage CoNtent As String';
      testNetworkRequestAction({
        action: requests.uploadImage,
        args: { image, ...fetchParams },
        expectedString: 'with uploadImage promise',
        expectedData: {
          ...fetchParams,
          requestKey: RequestKeys.uploadImage,
          promise: api.uploadImage({
            learningContextId: selectors.app.learningContextId(testState),
            image,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
          }),
        },
      });
    });
  });
});
