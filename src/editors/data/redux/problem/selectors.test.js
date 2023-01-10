// import * in order to mock in-file references
import { keyStore } from '../../../utils';
import * as selectors from './selectors';

jest.mock('reselect', () => ({
  createSelector: jest.fn((preSelectors, cb) => ({ preSelectors, cb })),
}));

const testState = { some: 'arbitraryValue' };
const testValue = 'my VALUE';

describe('problem selectors unit tests', () => {
  const {
    problemState,
    simpleSelectors,
  } = selectors;
  describe('problemState', () => {
    it('returns the problem data', () => {
      expect(problemState({ ...testState, problem: testValue })).toEqual(testValue);
    });
  });
  describe('simpleSelectors', () => {
    const testSimpleSelector = (key) => {
      test(`${key} simpleSelector returns its value from the problem store`, () => {
        const { preSelectors, cb } = simpleSelectors[key];
        expect(preSelectors).toEqual([problemState]);
        expect(cb({ ...testState, [key]: testValue })).toEqual(testValue);
      });
    };
    const simpleKeys = keyStore(simpleSelectors);
    describe('simple selectors link their values from problem store', () => {
      [
        simpleKeys.problemType,
        simpleKeys.answers,
        simpleKeys.correctAnswerCount,
        simpleKeys.settings,
        simpleKeys.question,
      ].map(testSimpleSelector);
    });
    test('simple selector completeState equals the entire state', () => {
      const { preSelectors, cb } = simpleSelectors[simpleKeys.completeState];
      expect(preSelectors).toEqual([problemState]);
      expect(cb({
        ...testState,
        [simpleKeys.completeState]: testValue,
      })).toEqual({
        ...testState,
        [simpleKeys.completeState]: testValue,
      });
    });
  });
});
