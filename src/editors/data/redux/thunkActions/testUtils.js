/* eslint-disable import/no-extraneous-dependencies */
/* istanbul ignore file */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

/** createTestFetcher(mockedMethod, thunkAction, args, onDispatch)
 * Creates a testFetch method, which will test a given thunkAction of the form:
 *   ```
 *   const <thunkAction> = (<args>) => (dispatch, getState) => {
 *   ...
 *   return <mockedMethod>.then().catch();
 *   ```
 * The returned function will take a promise handler function, a list of expected actions
 * to have been dispatched (objects only), and an optional verifyFn method to be called after
 * the fetch has been completed.
 *
 * @param {fn} mockedMethod - already-mocked api method being exercised by the thunkAction.
 * @param {fn} thunkAction - thunkAction to call/test
 * @param {array} args - array of args to dispatch the thunkAction with
 * @param {[fn]} onDispatch - optional function to be called after dispatch
 *
 * @return {fn} testFetch method
 *   @param {fn} resolveFn - promise handler of the form (resolve, reject) => {}.
 *     should return a call to resolve or reject with response data.
 *   @param {object[]} expectedActions - array of action objects expected to have been dispatched
 *     will be verified after the thunkAction resolves
 *   @param {[fn]} verifyFn - optional function to be called after dispatch
 */
export const createTestFetcher = (
  mockedMethod,
  thunkAction,
  args,
  onDispatch,
) => (
  resolveFn,
  expectedActions,
) => {
  const store = mockStore({});
  mockedMethod.mockReturnValue(new Promise(resolve => {
    resolve(new Promise(resolveFn));
  }));
  return store.dispatch(thunkAction(...args)).then(() => {
    onDispatch();
    if (expectedActions !== undefined) {
      expect(store.getActions()).toEqual(expectedActions);
    }
  });
};

export default {
  createTestFetcher,
};
