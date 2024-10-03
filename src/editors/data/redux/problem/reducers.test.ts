import { initialState, actions, reducer } from './reducers';
import { ProblemTypeKeys } from '../../constants/problem';

const testingState = {
  ...initialState,
  arbitraryField: 'arbitrary',
};

describe('problem reducer', () => {
  it('has initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(initialState);
  });

  const testValue = 'roll for initiative';

  describe('handling actions', () => {
    const setterTest = (action, target) => {
      describe(action, () => {
        it(`load ${target} from payload`, () => {
          expect(reducer(testingState, actions[action](testValue))).toEqual({
            ...testingState,
            isDirty: true,
            [target]: testValue,
          });
        });
      });
    };
    [
      ['updateQuestion', 'question'] as const,
    ].map(args => setterTest(...args));
    describe('setEnableTypeSelection', () => {
      it('sets given problemType to null', () => {
        const payload = {
          maxAttempts: 1,
          showanswer: 'finished',
          showResetButton: false,
        };
        expect(reducer(testingState, actions.setEnableTypeSelection(payload))).toEqual({
          ...testingState,
          settings: {
            ...testingState.settings,
            scoring: {
              ...testingState.settings.scoring,
              attempts: { number: 1, unlimited: false },
            },
            showAnswer: { ...testingState.settings.showAnswer, on: payload.showanswer },
            showResetButton: payload.showResetButton,
          },
          problemType: null,
        });
      });
    });
    describe('load', () => {
      it('sets answers', () => {
        const blankAnswer = {
          id: 'A',
          correct: false,
          selectedFeedback: '',
          title: '',
          isAnswerRange: false,
          unselectedFeedback: '',
        };
        expect(reducer(testingState, actions.addAnswer())).toEqual({
          ...testingState,
          answers: [blankAnswer],
          isDirty: true,
        });
      });
    });
    describe('updateField', () => {
      it('sets given parameter', () => {
        const payload = { problemType: 'soMePRoblEMtYPe' };
        expect(reducer(testingState, actions.updateField(payload))).toEqual({
          ...testingState,
          ...payload,
        });
      });
    });
    describe('updateSettings', () => {
      it('sets given settings parameter', () => {
        const payload = { hints: ['soMehInt'] };
        expect(reducer(testingState, actions.updateSettings(payload))).toEqual({
          ...testingState,
          isDirty: true,
          settings: {
            ...testingState.settings,
            ...payload,
          },
        });
      });
    });
    describe('addAnswer', () => {
      const answer = {
        id: 'A',
        correct: false,
        selectedFeedback: '',
        title: '',
        isAnswerRange: false,
        unselectedFeedback: '',
      };
      it('sets answers', () => {
        expect(reducer({ ...testingState, problemType: 'choiceresponse' }, actions.addAnswer())).toEqual({
          ...testingState,
          problemType: 'choiceresponse',
          isDirty: true,
          answers: [answer],
        });
      });
      it('sets answers for numeric input', () => {
        const numericTestState = {
          ...testingState,
          problemType: ProblemTypeKeys.NUMERIC,
          correctAnswerCount: 0,
        };
        expect(reducer(numericTestState, actions.addAnswer())).toEqual({
          ...numericTestState,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{
            ...answer,
            correct: true,
          }],
        });
      });
    });
    describe('addAnswerRange', () => {
      const answerRange = {
        id: 'A',
        correct: true,
        selectedFeedback: '',
        title: '',
        isAnswerRange: true,
        unselectedFeedback: '',
      };
      it('sets answerRange', () => {
        expect(reducer({ ...testingState, problemType: ProblemTypeKeys.NUMERIC }, actions.addAnswerRange())).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          isDirty: true,
          problemType: ProblemTypeKeys.NUMERIC,
          answers: [answerRange],
        });
      });
    });
    describe('updateAnswer', () => {
      it('sets answers, as well as setting the correctAnswerCount ', () => {
        const answer = { id: 'A', correct: true };
        expect(reducer(
          {
            ...testingState,
            answers: [{
              id: 'A',
              correct: false,
            }],
          },
          actions.updateAnswer(answer),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{ id: 'A', correct: true }],
        });
      });
    });
    describe('deleteAnswer', () => {
      let windowSpy;
      beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get');
      });
      afterEach(() => {
        windowSpy.mockRestore();
      });
      it('sets a default when deleting the last answer', () => {
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: 'mock-editors',
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: 'empty',
        };
        expect(reducer(
          {
            ...testingState,
            correctAnswerCount: 0,
            answers: [{ id: 'A', correct: false }],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          isDirty: true,
          correctAnswerCount: 0,
          answers: [{
            id: 'A',
            title: '',
            selectedFeedback: '',
            unselectedFeedback: '',
            correct: false,
            isAnswerRange: false,
          }],
        });
      });
      it('sets answers and correctAnswerCount', () => {
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: 'mock-editors',
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: {
            answers: { A: 'mockA' },
          },
        };
        expect(reducer(
          {
            ...testingState,
            correctAnswerCount: 1,
            answers: [
              { id: 'A', correct: false },
              { id: 'B', correct: true },
            ],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{
            id: 'A',
            correct: true,
            selectedFeedback: '',
            unselectedFeedback: '',
          }],
        });
      });
      it('sets answers and correctAnswerCount with editorState for RichTextProblems', () => {
        const setContent = jest.fn();
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: {
              'answer-A': { setContent },
              'answer-B': { setContent },
            },
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: {
            answers: { A: 'editorAnsA', B: 'editorAnsB' },
          },
        };
        expect(reducer(
          {
            ...testingState,
            problemType: ProblemTypeKeys.SINGLESELECT,
            correctAnswerCount: 1,
            answers: [
              { id: 'A', correct: false },
              { id: 'B', correct: true },
            ],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          problemType: ProblemTypeKeys.SINGLESELECT,
          isDirty: true,
          correctAnswerCount: 1,
          answers: [{
            id: 'A',
            correct: true,
            title: 'editorAnsB',
            selectedFeedback: '',
            unselectedFeedback: '',
          }],
        });
      });
      it('sets selectedFeedback and unselectedFeedback with editorState', () => {
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: {
              'answer-A': 'mockEditor',
              'answer-B': 'mockEditor',
            },
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: {
            answers: { A: 'editorAnsA', B: 'editorAnsB' },
            selectedFeedback: { A: 'editSelFA', B: 'editSelFB' },
            unselectedFeedback: { A: 'editUnselFA', B: 'editUnselFB' },
          },
        };
        expect(reducer(
          {
            ...testingState,
            correctAnswerCount: 1,
            answers: [
              { id: 'A', correct: false },
              { id: 'B', correct: true },
            ],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{
            id: 'A',
            correct: true,
            selectedFeedback: 'editSelFB',
            unselectedFeedback: 'editUnselFB',
          }],
        });
      });
      it('calls editor setContent to set answer and feedback fields', () => {
        const setContent = jest.fn();
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: {
              'answer-A': { setContent },
              'answer-B': { setContent },
              'selectedFeedback-A': { setContent },
              'selectedFeedback-B': { setContent },
              'unselectedFeedback-A': { setContent },
              'unselectedFeedback-B': { setContent },
            },
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: {
            answers: { A: 'editorAnsA', B: 'editorAnsB' },
            selectedFeedback: { A: 'editSelFA', B: 'editSelFB' },
            unselectedFeedback: { A: 'editUnselFA', B: 'editUnselFB' },
          },
        };
        reducer(
          {
            ...testingState,
            problemType: ProblemTypeKeys.SINGLESELECT,
            correctAnswerCount: 1,
            answers: [
              { id: 'A', correct: false },
              { id: 'B', correct: true },
            ],
          },
          actions.deleteAnswer(payload),
        );
        expect((window as any).tinymce.editors['answer-A'].setContent).toHaveBeenCalled();
        expect((window as any).tinymce.editors['answer-A'].setContent).toHaveBeenCalledWith('editorAnsB');
        expect((window as any).tinymce.editors['selectedFeedback-A'].setContent).toHaveBeenCalledWith('editSelFB');
        expect((window as any).tinymce.editors['unselectedFeedback-A'].setContent).toHaveBeenCalledWith('editUnselFB');
      });
      it('sets groupFeedbackList by removing the checked item in the groupFeedback', () => {
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: 'mock-editors',
          },
        }));
        const payload = {
          id: 'A',
          correct: false,
          editorState: {
            answer: { A: 'aNSwERA', B: 'anSWeRB' },
          },
        };
        expect(reducer(
          {
            ...testingState,
            correctAnswerCount: 1,
            answers: [
              { id: 'A', correct: false },
              { id: 'B', correct: true },
              { id: 'C', correct: false },
            ],
            groupFeedbackList: [{
              id: 0,
              answers: ['A', 'C'],
              feedback: 'fake feedback',
            }],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{
            id: 'A',
            correct: true,
            selectedFeedback: '',
            unselectedFeedback: '',
          },
          {
            id: 'B',
            correct: false,
            selectedFeedback: '',
            unselectedFeedback: '',
          }],
          groupFeedbackList: [{
            id: 0,
            answers: ['B'],
            feedback: 'fake feedback',
          }],
        });
      });
      it('if you delete an answer range, it will be replaced with a blank answer', () => {
        windowSpy.mockImplementation(() => ({
          tinymce: {
            editors: 'mock-editors',
          },
        }));
        const payload = {
          id: 'A',
          correct: true,
          editorState: 'mockEditoRStAte',
        };
        expect(reducer(
          {
            ...testingState,
            problemType: ProblemTypeKeys.NUMERIC,
            correctAnswerCount: 1,
            answers: [{
              id: 'A',
              correct: false,
              selectedFeedback: '',
              title: '',
              isAnswerRange: true,
              unselectedFeedback: '',
            }],
          },
          actions.deleteAnswer(payload),
        )).toEqual({
          ...testingState,
          problemType: ProblemTypeKeys.NUMERIC,
          correctAnswerCount: 1,
          isDirty: true,
          answers: [{
            id: 'A',
            title: '',
            selectedFeedback: '',
            unselectedFeedback: '',
            correct: true,
            isAnswerRange: false,
          }],
        });
      });
    });
  });
});
