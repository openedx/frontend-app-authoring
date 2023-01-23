import { useEffect } from 'react';
import { MockUseState } from '../../../../../../testUtils';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import * as module from './hooks';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    updateState,
    useEffect: jest.fn(),
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateState({ val, newVal })])),
  };
});

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      deleteAnswer: (args) => ({ deleteAnswer: args }),
      updateAnswer: (args) => ({ updateAnswer: args }),
    },
  },
}));

const state = new MockUseState(module);

let output;
const answerWithOnlyFeedback = {
  id: 'A',
  title: 'Answer 1',
  correct: true,
  feedback: 'some feedback',
};

describe('Answer Options Hooks', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  describe('state hooks', () => {
    state.testGetter(state.keys.isFeedbackVisible);
  });
  describe('prepareFeedback hook', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });
    test('test default state is false', () => {
      output = module.prepareFeedback(answerWithOnlyFeedback);
      expect(output.isFeedbackVisible).toBeFalsy();
    });
    test('when useEffect triggers, isFeedbackVisible is set to true', () => {
      const key = state.keys.isFeedbackVisible;
      output = module.prepareFeedback(answerWithOnlyFeedback);
      expect(state.setState[key]).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs[0]).toStrictEqual(answerWithOnlyFeedback);
      cb();
      expect(state.setState[key]).toHaveBeenCalledWith(true);
    });
  });
  describe('isSingleAnswerProblem()', () => {
    test('singleSelect', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.SINGLESELECT)).toBe(true);
    });
    test('multiSelect', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.MULTISELECT)).toBe(false);
    });
    test('dropdown', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.DROPDOWN)).toBe(true);
    });
  });
});
