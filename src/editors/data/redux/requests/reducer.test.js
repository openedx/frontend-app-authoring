import { initialState, actions, reducer } from './reducer';
import { RequestStates, RequestKeys } from '../../constants/requests';

describe('requests reducer', () => {
  test('intial state generated on create', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('handling actions', () => {
    const arbitraryKey = 'ArbItrAryKey';
    const requestsList = [RequestKeys.fetchUnit, RequestKeys.fetchBlock, RequestKeys.saveBlock, arbitraryKey];

    requestsList.forEach(requestKey => {
      describe(`${requestKey} lifecycle`, () => {
        const testAction = (action, args, expected) => {
          const testingState = {
            ...initialState,
            arbitraryField: 'arbitrary',
            [requestKey]: { arbitrary: 'state' },
          };
          expect(reducer(testingState, actions[action](args))).toEqual({
            ...testingState,
            [requestKey]: expected,
          });
        };
        test('startRequest sets pending status', () => {
          testAction('startRequest', requestKey, { status: RequestStates.pending });
        });
        test('completeRequest sets completed status and loads response', () => {
          testAction(
            'completeRequest',
            { requestKey },
            { status: RequestStates.completed },
          );
        });
        test('failRequest sets failed state and loads error', () => {
          testAction(
            'failRequest',
            { requestKey },
            { status: RequestStates.failed },
          );
        });
        test('clearRequest clears request state', () => {
          testAction('clearRequest', { requestKey }, {});
        });
      });
    });
  });
});
