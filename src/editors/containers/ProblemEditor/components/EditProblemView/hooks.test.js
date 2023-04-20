import { ProblemTypeKeys } from '../../../../data/constants/problem';
import * as hooks from './hooks';
import { MockUseState } from '../../../../../testUtils';

const mockRawOLX = 'rawOLX';
const mockBuiltOLX = 'builtOLX';

const toStringMock = () => mockRawOLX;
const refMock = { current: { state: { doc: { toString: toStringMock } } } };

jest.mock('../../data/ReactStateOLXParser', () => (
  jest.fn().mockImplementation(() => ({
    buildOLX: () => mockBuiltOLX,
  }))
));
jest.mock('../../data/ReactStateSettingsParser');

const hookState = new MockUseState(hooks);

describe('noAnswerModalToggle', () => {
  const hookKey = hookState.keys.isNoAnswerModalOpen;
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hook', () => {
    hookState.testGetter(hookKey);
  });
  describe('using state', () => {
    beforeEach(() => {
      hookState.mock();
    });
    afterEach(() => {
      hookState.restore();
    });

    describe('noAnswerModalToggle', () => {
      let hook;
      beforeEach(() => {
        hook = hooks.noAnswerModalToggle();
      });
      test('isNoAnswerModalOpen: state value', () => {
        expect(hook.isNoAnswerModalOpen).toEqual(hookState.stateVals[hookKey]);
      });
      test('openCancelConfirmModal: calls setter with true', () => {
        hook.openNoAnswerModal();
        expect(hookState.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeCancelConfirmModal: calls setter with false', () => {
        hook.closeNoAnswerModal();
        expect(hookState.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });
  });
});

describe('EditProblemView hooks parseState', () => {
  describe('fetchEditorContent', () => {
    const getContent = () => '<p>testString</p>';
    test('returns answers', () => {
      window.tinymce.editors = { 'answer-A': { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ answers: { A: '<p>testString</p>' }, hints: [] });
    });
    test('returns hints', () => {
      window.tinymce.editors = { 'hint-0': { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ hints: ['<p>testString</p>'] });
    });
    test('returns question', () => {
      window.tinymce.editors = { question: { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ question: '<p>testString</p>', hints: [] });
    });
    test('returns selectedFeedback', () => {
      window.tinymce.editors = { 'selectedFeedback-A': { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ selectedFeedback: { A: '<p>testString</p>' }, hints: [] });
    });
    test('returns unselectedFeedback', () => {
      window.tinymce.editors = { 'unselectedFeedback-A': { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ unselectedFeedback: { A: '<p>testString</p>' }, hints: [] });
    });
    test('returns groupFeedback', () => {
      window.tinymce.editors = { 'groupFeedback-0': { getContent } };
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ groupFeedback: { 0: '<p>testString</p>' }, hints: [] });
    });
    test('returns groupFeedback', () => {
      window.tinymce.editors = {};
      const editorObject = hooks.fetchEditorContent({ format: '' });
      expect(editorObject).toEqual({ hints: [] });
    });
  });
  describe('parseState', () => {
    test('default problem', () => {
      const res = hooks.parseState({
        problem: 'problem',
        isAdvanced: false,
        ref: refMock,
        assets: {},
      })();
      expect(res.olx).toBe(mockBuiltOLX);
    });
    test('advanced problem', () => {
      const res = hooks.parseState({
        problem: 'problem',
        isAdvanced: true,
        ref: refMock,
        assets: {},
      })();
      expect(res.olx).toBe(mockRawOLX);
    });
  });
  describe('checkNoAnswers', () => {
    const openNoAnswerModal = jest.fn();
    describe('hasNoTitle', () => {
      const problem = {
        problemType: ProblemTypeKeys.NUMERIC,
      };
      beforeEach(() => {
        jest.clearAllMocks();
      });
      it('returns true for numerical problem with empty title', () => {
        const expected = hooks.checkForNoAnswers({
          openNoAnswerModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: '', correct: true }],
          },
        });
        expect(openNoAnswerModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns false for numerical problem with title', () => {
        const expected = hooks.checkForNoAnswers({
          openNoAnswerModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: true }],
          },
        });
        expect(openNoAnswerModal).not.toHaveBeenCalled();
        expect(expected).toEqual(false);
      });
    });
    describe('hasNoCorrectAnswer', () => {
      const problem = {
        problemType: ProblemTypeKeys.SINGLESELECT,
      };
      beforeEach(() => {
        jest.clearAllMocks();
      });
      it('returns true for single select problem with empty title', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => '' }, 'answer-B': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openNoAnswerModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: '', correct: true }, { id: 'B', title: 'sOmevALUe', correct: false }],
          },
        });
        expect(openNoAnswerModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns true for single select with title but no correct answer', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openNoAnswerModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: false }, { id: 'B', title: '', correct: false }],
          },
        });
        expect(openNoAnswerModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns true for single select with title and correct answer', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openNoAnswerModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: true }],
          },
        });
        expect(openNoAnswerModal).not.toHaveBeenCalled();
        expect(expected).toEqual(false);
      });
    });
  });
  describe('getContent', () => {
    const problemState = { problemType: ProblemTypeKeys.NUMERIC, answers: [{ id: 'A', title: 'problem', correct: true }] };
    const isAdvancedProblem = false;
    const assets = {};
    const lmsEndpointUrl = 'someUrl';
    const editorRef = refMock;
    const openNoAnswerModal = jest.fn();

    test('default save and returns parseState data', () => {
      const content = hooks.getContent({
        problemState,
        isAdvancedProblem,
        editorRef,
        assets,
        lmsEndpointUrl,
        openNoAnswerModal,
      });
      expect(content).toEqual({
        olx: 'builtOLX',
        settings: undefined,
      });
    });
    test('returns null', () => {
      const problem = { ...problemState, answers: [{ id: 'A', title: '', correct: true }] };
      const content = hooks.getContent({
        problemState: problem,
        isAdvancedProblem,
        editorRef,
        assets,
        lmsEndpointUrl,
        openNoAnswerModal,
      });
      expect(openNoAnswerModal).toHaveBeenCalled();
      expect(content).toEqual(null);
    });
  });
});
