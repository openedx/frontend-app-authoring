import 'CourseAuthoring/editors/setupEditorTest';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../../../../data/redux';
import { MockUseState } from '../../../../../testUtils';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    useEffect: jest.fn(),
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateState({ val, newVal })])),
  };
});
jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: m => m,
}));
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
let windowSpy;

describe('Answer Options Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.isFeedbackVisible);
  });
  describe('removeAnswer', () => {
    beforeEach(() => {
      windowSpy = jest.spyOn(window, 'window', 'get');
    });
    afterEach(() => {
      windowSpy.mockRestore();
    });
    const answer = { id: 'A', correct: false };
    const dispatch = useDispatch();
    it('dispatches actions.problem.deleteAnswer', () => {
      windowSpy.mockImplementation(() => ({ tinymce: { editors: { 'answer-A': { getContent: () => 'string' } } } }));
      module.removeAnswer({
        answer,
        dispatch,
      })();
      expect(dispatch).toHaveBeenCalledWith(actions.problem.deleteAnswer({
        id: answer.id,
        correct: answer.correct,
        editorState: {
          answers: { A: 'string' },
          hints: [],
        },
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
  describe('setAnswerTitle', () => {
    test('it dispatches actions.problem.updateAnswer for numeric problem', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const updatedTitle = { target: { value: 'string' } };
      const problemType = 'numericalresponse';
      module.setAnswerTitle({
        answer,
        hasSingleAnswer,
        dispatch,
        problemType,
      })(updatedTitle);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        title: updatedTitle.target.value,
      }));
    });
    test('it dispatches actions.problem.updateAnswer for single select problem', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const updatedTitle = 'string';
      const problemType = 'multiplechoiceresponse';
      module.setAnswerTitle({
        answer,
        hasSingleAnswer,
        dispatch,
        problemType,
      })(updatedTitle);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        title: updatedTitle,
      }));
    });
  });
  describe('setSelectedFeedback', () => {
    test('it dispatches actions.problem.updateAnswer', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const value = 'string';
      module.setSelectedFeedback({ answer, hasSingleAnswer, dispatch })(value);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        selectedFeedback: value,
      }));
    });
  });
  describe('setUnselectedFeedback', () => {
    test('it dispatches actions.problem.updateAnswer', () => {
      const answer = { id: 'A' };
      const hasSingleAnswer = false;
      const dispatch = useDispatch();
      const value = 'string';
      module.setUnselectedFeedback({ answer, hasSingleAnswer, dispatch })(value);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.updateAnswer({
        id: answer.id,
        hasSingleAnswer,
        unselectedFeedback: value,
      }));
    });
  });
  describe('useFeedback hook', () => {
    beforeEach(() => {
      state.mock();
      windowSpy = jest.spyOn(window, 'window', 'get');
    });
    afterEach(() => {
      state.restore();
      windowSpy.mockRestore();
    });
    test('default state is false', () => {
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
    test('toggleFeedback with selected feedback', () => {
      const key = state.keys.isFeedbackVisible;
      output = module.useFeedback(answerWithOnlyFeedback);
      windowSpy.mockImplementation(() => ({ tinymce: { editors: { 'selectedFeedback-A': { getContent: () => 'string' } } } }));
      output.toggleFeedback(false);
      expect(state.setState[key]).toHaveBeenCalledWith(true);
    });
    test('toggleFeedback with unselected feedback', () => {
      const key = state.keys.isFeedbackVisible;
      output = module.useFeedback(answerWithOnlyFeedback);
      windowSpy.mockImplementation(() => ({ tinymce: { editors: { 'unselectedFeedback-A': { getContent: () => 'string' } } } }));
      output.toggleFeedback(false);
      expect(state.setState[key]).toHaveBeenCalledWith(true);
    });
    test('toggleFeedback with unselected feedback', () => {
      const key = state.keys.isFeedbackVisible;
      output = module.useFeedback(answerWithOnlyFeedback);
      windowSpy.mockImplementation(() => ({ tinymce: { editors: { 'answer-A': { getContent: () => 'string' } } } }));
      output.toggleFeedback(false);
      expect(state.setState[key]).toHaveBeenCalledWith(false);
    });
  });
  describe('isSingleAnswerProblem()', () => {
    test('singleSelect', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.SINGLESELECT)).toBe(false);
    });
    test('multiSelect', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.MULTISELECT)).toBe(false);
    });
    test('dropdown', () => {
      expect(module.isSingleAnswerProblem(ProblemTypeKeys.DROPDOWN)).toBe(true);
    });
  });
});
