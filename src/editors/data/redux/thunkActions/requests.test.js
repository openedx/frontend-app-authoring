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
  courseId: (state) => ({ courseId: state }),
  blockTitle: (state) => ({ title: state }),
}));

jest.mock('../../services/cms/api', () => ({
  fetchBlockById: ({ id, url }) => ({ id, url }),
  fetchByUnitId: ({ id, url }) => ({ id, url }),
  saveBlock: (args) => args,
}));

let dispatch;
let onSuccess;
let onFailure;
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
    const fetchParams = { fetchParam1: 'param1', fetchParam2: 'param2' };
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
    describe('saveBlock', () => {
      const content = 'SoME HtMl CoNtent As String';
      testNetworkRequestAction({
        action: requests.saveBlock,
        args: { content, some: 'data' },
        expectedString: 'with saveBlock promise',
        expectedData: {
          ...testState,
          requestKey: RequestKeys.saveBlock,
          promise: api.saveBlock({
            blockId: selectors.app.blockId(testState),
            blockType: selectors.app.blockType(testState),
            courseId: selectors.app.courseId(testState),
            content,
            studioEndpointUrl: selectors.app.studioEndpointUrl(testState),
            title: selectors.app.blockTitle(testState),
          }),
        },
      });
    });
  });
});
