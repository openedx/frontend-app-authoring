// import * in order to mock in-file references
import { keyStore } from '../../../utils';
import * as selectors from './selectors';

const testState = { some: 'arbitraryValue' };
const testValue = 'my VALUE';

describe('problem selectors unit tests', () => {
  const {
    problemState,
    simpleSelectors,
  } = selectors;
  describe('problemState', () => {
    it('returns the problem data', () => {
      expect(problemState({ ...testState, problem: testValue } as any)).toEqual(testValue);
    });
  });
  describe('simpleSelectors', () => {
    const testSimpleSelector = (key) => {
      test(`${key} simpleSelector returns its value from the problem store`, () => {
        const { dependencies, resultFunc: cb } = simpleSelectors[key];
        expect(dependencies).toEqual([problemState]);
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
        simpleKeys.defaultSettings,
      ].map(testSimpleSelector);
    });
    test('simple selector completeState equals the entire state', () => {
      const { dependencies, resultFunc: cb } = simpleSelectors[simpleKeys.completeState];
      expect(dependencies).toEqual([problemState]);
      expect(cb({
        ...testState,
        [simpleKeys.completeState]: testValue,
      } as any)).toEqual({
        ...testState,
        [simpleKeys.completeState]: testValue,
      });
    });
  });
});
