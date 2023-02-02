import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../../../../data/redux';
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
  selectedFeedback: 'some feedback',
};

describe('Answer Options Hooks', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  describe('state hooks', () => {
    state.testGetter(state.keys.isFeedbackVisible);
  });
  describe('removeAnswer', () => {
    test('it dispatches actions.problem.deleteAnswer', () => {
      const answer = { id: 'A', correct: false };
      const dispatch = useDispatch();
      module.removeAnswer({ answer, dispatch })();
      expect(dispatch).toHaveBeenCalledWith(actions.problem.deleteAnswer({
        id: answer.id,
        correct: answer.correct,
      }));
    });
  });
  describe('setAnswer', () => {
    test('it dispatches actions.problem.updateAnswer', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const payload = { random: 'string' };
      module.setAnswer({ answer, hasSingleAnswer, dispatch })(payload);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        ...payload,
      }));
    });
  });
  describe('setSelectedFeedback', () => {
    test('it dispatches actions.problem.updateAnswer', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const e = { target: { value: 'string' } };
      module.setSelectedFeedback({ answer, hasSingleAnswer, dispatch })(e);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        selectedFeedback: e.target.value,
      }));
    });
  });
  describe('setUnselectedFeedback', () => {
    test('it dispatches actions.problem.updateAnswer', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const e = { target: { value: 'string' } };
      module.setUnselectedFeedback({ answer, hasSingleAnswer, dispatch })(e);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        unselectedFeedback: e.target.value,
      }));
    });
  });
  describe('useFeedback hook', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });
    test('test default state is false', () => {
      output = module.useFeedback(answerWithOnlyFeedback);
      expect(output.isFeedbackVisible).toBeFalsy();
    });
    test('when useEffect triggers, isFeedbackVisible is set to true', () => {
      const key = state.keys.isFeedbackVisible;
      output = module.useFeedback(answerWithOnlyFeedback);
      expect(state.setState[key]).not.toHaveBeenCalled();
      const [cb] = useEffect.mock.calls[0];
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
