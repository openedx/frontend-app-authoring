/* eslint-disable no-import-assign */
import { RequestStates } from '../../constants/requests';

// import * in order to mock in-file references
import * as selectors from './selectors';

jest.mock('reselect', () => ({
  createSelector: jest.fn((preSelectors, cb) => ({ preSelectors, cb })),
}));

const testValue = 'my test VALUE';
const testKey = 'MY test key';

describe('request selectors', () => {
  describe('basic selectors', () => {
    describe('requestStatus', () => {
      it('returns the state associated with the given requestKey', () => {
        expect(
          selectors.requestStatus(
            { requests: { [testKey]: testValue } },
            { requestKey: testKey },
          ),
        ).toEqual(testValue);
      });
    });
    describe('statusSelector', () => {
      it('returns a state selector that applies a fn against request state by requestKey', () => {
        const myMethod = ({ data }) => ({ myData: data });
        expect(selectors.statusSelector(myMethod)(
          { requests: { [testKey]: { data: testValue } } },
          { requestKey: testKey },
        )).toEqual({ myData: testValue });
      });
    });
    describe('state selectors', () => {
      const testStateSelector = (selector, expected) => {
        describe(selector, () => {
          it(`returns true iff the request status equals ${expected}`, () => {
            expect(selectors[selector]({ status: expected })).toEqual(true);
            expect(selectors[selector]({ status: 'other' })).toEqual(false);
          });
        });
      };
      testStateSelector('isInactive', RequestStates.inactive);
      testStateSelector('isPending', RequestStates.pending);
      testStateSelector('isCompleted', RequestStates.completed);
      testStateSelector('isFailed', RequestStates.failed);
      describe('isFinished', () => {
        it('returns true iff the request is completed or failed', () => {
          expect(selectors.isFinished({ status: RequestStates.completed })).toEqual(true);
          expect(selectors.isFinished({ status: RequestStates.failed })).toEqual(true);
          expect(selectors.isFinished({ status: 'other' })).toEqual(false);
        });
      });
    });
    describe('error selectors', () => {
      describe('error', () => {
        it('returns the error for the request', () => {
          expect(selectors.error({ error: testValue })).toEqual(testValue);
        });
      });
      describe('errorStatus', () => {
        it('returns the status the error response iff one exists', () => {
          expect(selectors.errorStatus({})).toEqual(undefined);
          expect(selectors.errorStatus({ error: {} })).toEqual(undefined);
          expect(selectors.errorStatus({ error: { response: {} } })).toEqual(undefined);
          expect(selectors.errorStatus(
            { error: { response: { status: testValue } } },
          )).toEqual(testValue);
        });
      });
      describe('errorCode', () => {
        it('returns the status the error code iff one exists', () => {
          expect(selectors.errorCode({})).toEqual(undefined);
          expect(selectors.errorCode({ error: {} })).toEqual(undefined);
          expect(selectors.errorCode({ error: { response: {} } })).toEqual(undefined);
          expect(selectors.errorCode(
            { error: { response: { data: testValue } } },
          )).toEqual(testValue);
        });
      });
    });
    describe('data', () => {
      it('returns the data from the request', () => {
        expect(selectors.data({ data: testValue })).toEqual(testValue);
      });
    });
  });
  describe('exported selectors', () => {
    test('requestStatus forwards basic selector', () => {
      expect(selectors.default.requestStatus).toEqual(selectors.requestStatus);
    });
    describe('statusSelector selectors', () => {
      let statusSelector;
      let connectedSelectors;
      beforeEach(() => {
        statusSelector = selectors.statusSelector;
        selectors.statusSelector = jest.fn(key => ({ statusSelector: key }));
        connectedSelectors = selectors.connectedStatusSelectors();
      });
      afterEach(() => {
        selectors.statusSelector = statusSelector;
      });
      const testStatusSelector = (name) => {
        describe(name, () => {
          it(`returns a status selector keyed to the ${name} selector`, () => {
            expect(connectedSelectors[name].statusSelector).toEqual(selectors[name]);
          });
        });
      };
      [
        'isInactive',
        'isPending',
        'isCompleted',
        'isFailed',
        'error',
        'errorCode',
        'errorStatus',
        'data',
      ].map(testStatusSelector);
    });
  });
});
