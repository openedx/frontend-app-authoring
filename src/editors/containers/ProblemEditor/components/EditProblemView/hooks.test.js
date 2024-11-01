import { ProblemTypeKeys, ShowAnswerTypesKeys } from '../../../../data/constants/problem';
import * as hooks from './hooks';
import { MockUseState } from '../../../../testUtils';

const mockRawOLX = '<problem>rawOLX</problem>';
const mockBuiltOLX = 'builtOLX';
const mockGetSettings = {
  max_attempts: 1,
  weight: 2,
  showanswer: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
  show_reset_button: false,
  rerandomize: 'never',
};
const mockParseRawOlxSettingsDiscrepancy = {
  max_attempts: 1,
  weight: 2,
  showanswer: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
  show_reset_button: true,
  rerandomize: 'never',
};
const mockParseRawOlxSettings = {
  max_attempts: 1,
  weight: 2,
  showanswer: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
  show_reset_button: false,
  rerandomize: 'never',
};
const problemState = {
  problemType: ProblemTypeKeys.ADVANCED,
  defaultSettings: {},
  settings: {
    randomization: null,
    scoring: {
      weight: 1,
      attempts: {
        unlimited: true,
        number: '',
      },
    },
    timeBetween: 0,
    showAnswer: {
      on: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
      afterAttempts: 0,
    },
    showResetButton: false,
    solutionExplanation: '',
  },
};

const toStringMock = () => mockRawOLX;
const refMock = { current: { state: { doc: { toString: toStringMock } } } };

jest.mock('../../data/ReactStateOLXParser', () => (
  jest.fn().mockImplementation(() => ({
    buildOLX: () => mockBuiltOLX,
  }))
));

const hookState = new MockUseState(hooks);

describe('saveWarningModalToggle', () => {
  const hookKey = hookState.keys.isSaveWarningModalOpen;
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

    describe('saveWarningModalToggle', () => {
      let hook;
      beforeEach(() => {
        hook = hooks.saveWarningModalToggle();
      });
      test('isSaveWarningModalOpen: state value', () => {
        expect(hook.isSaveWarningModalOpen).toEqual(hookState.stateVals[hookKey]);
      });
      test('openSaveWarningModal: calls setter with true', () => {
        hook.openSaveWarningModal();
        expect(hookState.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeSaveWarningModal: calls setter with false', () => {
        hook.closeSaveWarningModal();
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
    jest.mock('../../data/ReactStateSettingsParser', () => (
      jest.fn().mockImplementationOnce(() => ({
        getSettings: () => mockGetSettings,
        parseRawOlxSettings: () => mockParseRawOlxSettings,
      }))
    ));
    it('default problem', () => {
      const res = hooks.parseState({
        problem: problemState,
        isAdvanced: false,
        ref: refMock,
        assets: {},
      })();
      expect(res.olx).toBe(mockBuiltOLX);
    });
    it('advanced problem', () => {
      const res = hooks.parseState({
        problem: problemState,
        isAdvanced: true,
        ref: refMock,
        assets: {},
      })();
      expect(res.olx).toBe(mockRawOLX);
    });
  });
  describe('checkNoAnswers', () => {
    const openSaveWarningModal = jest.fn();
    describe('hasTitle', () => {
      const problem = {
        problemType: ProblemTypeKeys.NUMERIC,
      };
      beforeEach(() => {
        jest.clearAllMocks();
      });
      it('should call openSaveWarningModal for numerical problem with empty title', () => {
        const expected = hooks.checkForNoAnswers({
          openSaveWarningModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: '', correct: true }],
          },
        });
        expect(openSaveWarningModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns false for numerical problem with title', () => {
        const expected = hooks.checkForNoAnswers({
          openSaveWarningModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: true }],
          },
        });
        expect(openSaveWarningModal).not.toHaveBeenCalled();
        expect(expected).toEqual(false);
      });
    });
    describe('hasCorrectAnswer', () => {
      const problem = {
        problemType: ProblemTypeKeys.SINGLESELECT,
      };
      beforeEach(() => {
        jest.clearAllMocks();
      });
      it('should call openSaveWarningModal for single select problem with empty title', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => '' }, 'answer-B': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openSaveWarningModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: '', correct: true }, { id: 'B', title: 'sOmevALUe', correct: false }],
          },
        });
        expect(openSaveWarningModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns true for single select with title but no correct answer', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openSaveWarningModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: false }, { id: 'B', title: '', correct: false }],
          },
        });
        expect(openSaveWarningModal).toHaveBeenCalled();
        expect(expected).toEqual(true);
      });
      it('returns true for single select with title and correct answer', () => {
        window.tinymce.editors = { 'answer-A': { getContent: () => 'sOmevALUe' } };
        const expected = hooks.checkForNoAnswers({
          openSaveWarningModal,
          problem: {
            ...problem,
            answers: [{ id: 'A', title: 'sOmevALUe', correct: true }],
          },
        });
        expect(openSaveWarningModal).not.toHaveBeenCalled();
        expect(expected).toEqual(false);
      });
    });
  });
  describe('checkForSettingDiscrepancy', () => {
    const openSaveWarningModal = jest.fn();
    const problem = problemState;
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('returns true for setting discrepancies', () => {
      jest.mock('../../data/ReactStateSettingsParser', () => (
        jest.fn().mockImplementationOnce(() => ({
          getSettings: () => mockGetSettings,
          parseRawOlxSettings: () => mockParseRawOlxSettingsDiscrepancy,
        }))
      ));
      const mockRawOLXWithSettings = '<problem show_reset_button="true">rawOLX</problem>';
      const refMockWithSettings = { current: { state: { doc: { toString: () => mockRawOLXWithSettings } } } };
      const expected = hooks.checkForSettingDiscrepancy({
        openSaveWarningModal,
        problem,
        ref: refMockWithSettings,
      });
      expect(openSaveWarningModal).toHaveBeenCalled();
      expect(expected).toEqual(true);
    });
    it('returns false when there are no setting discrepancies', () => {
      jest.mock('../../data/ReactStateSettingsParser', () => (
        jest.fn().mockImplementationOnce(() => ({
          getSettings: () => mockGetSettings,
          parseRawOlxSettings: () => mockParseRawOlxSettings,
        }))
      ));
      const expected = hooks.checkForSettingDiscrepancy({
        openSaveWarningModal,
        problem,
        ref: refMock,
      });
      expect(openSaveWarningModal).not.toHaveBeenCalled();
      expect(expected).toEqual(false);
    });
  });
  describe('getContent', () => {
    const assets = {};
    const lmsEndpointUrl = 'someUrl';
    const editorRef = refMock;
    const expectedSettings = {
      max_attempts: '',
      weight: 1,
      showanswer: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
      show_reset_button: false,
      submission_wait_seconds: 0,
      attempts_before_showanswer_button: 0,
    };
    const openSaveWarningModal = jest.fn();

    it('default visual save and returns parseState data', () => {
      const problem = { ...problemState, problemType: ProblemTypeKeys.NUMERIC, answers: [{ id: 'A', title: 'problem', correct: true }] };
      const content = hooks.getContent({
        isAdvancedProblemType: false,
        problemState: problem,
        editorRef,
        assets,
        lmsEndpointUrl,
        openSaveWarningModal,
      });
      expect(content).toEqual({
        olx: 'builtOLX',
        settings: expectedSettings,
      });
    });

    it('returned parseState content.settings should not include default values (not including maxAttempts)', () => {
      const problem = {
        ...problemState,
        problemType: ProblemTypeKeys.NUMERIC,
        answers: [{ id: 'A', title: 'problem', correct: true }],
        defaultSettings: {
          maxAttempts: '',
          showanswer: ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
          showResetButton: false,
          rerandomize: 'never',
        },
      };
      const { settings } = hooks.getContent({
        isAdvancedProblemType: false,
        problemState: problem,
        editorRef,
        assets,
        lmsEndpointUrl,
        openSaveWarningModal,
      });
      expect(settings).toEqual({
        max_attempts: '',
        attempts_before_showanswer_button: 0,
        submission_wait_seconds: 0,
        weight: 1,
      });
    });

    it('default advanced save and returns parseState data', () => {
      const content = hooks.getContent({
        isAdvancedProblemType: true,
        problemState,
        editorRef,
        assets,
        lmsEndpointUrl,
        openSaveWarningModal,
      });
      expect(content).toEqual({
        olx: '<problem>rawOLX</problem>',
        settings: expectedSettings,
      });
    });
    it('should return null', () => {
      const problem = { ...problemState, problemType: ProblemTypeKeys.NUMERIC, answers: [{ id: 'A', title: '', correct: true }] };
      const content = hooks.getContent({
        isAdvancedProblemType: false,
        problemState: problem,
        editorRef,
        assets,
        lmsEndpointUrl,
        openSaveWarningModal,
      });
      expect(openSaveWarningModal).toHaveBeenCalled();
      expect(content).toEqual(null);
    });
  });
});

describe('checkIfEditorsDirty', () => {
  let windowSpy;
  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });
  afterEach(() => {
    windowSpy.mockRestore();
  });
  describe('state hook', () => {
    test('should return false if none of editors are dirty', () => {
      windowSpy.mockImplementation(() => ({
        tinymce: {
          editors: {
            some_id: { isNotDirty: true },
            some_id2: { isNotDirty: true },
            some_id3: { isNotDirty: true },
            some_id4: { isNotDirty: true },
            some_id5: { isNotDirty: true },
          },
        },
      }));
      expect(hooks.checkIfEditorsDirty()).toEqual(false);
    });
    test('should return true if any editor is dirty', () => {
      windowSpy.mockImplementation(() => ({
        tinymce: {
          editors: {
            some_id: { isNotDirty: true },
            some_id2: { isNotDirty: true },
            some_id3: { isNotDirty: false },
            some_id4: { isNotDirty: true },
            some_id5: { isNotDirty: false },
          },
        },
      }));
      expect(hooks.checkIfEditorsDirty()).toEqual(true);
    });
  });
});
