import 'CourseAuthoring/editors/setupEditorTest';
import { actions } from '..';
import {
  initializeProblem,
  switchToAdvancedEditor,
  switchToMarkdownEditor,
  switchEditor,
  fetchAdvancedSettings,
  loadProblem,
} from './problem';
import { checkboxesOLXWithFeedbackAndHintsOLX, advancedProblemOlX, blankProblemOLX } from '../../../containers/ProblemEditor/data/mockData/olxTestData';
import { ProblemTypeKeys } from '../../constants/problem';

const mockOlx = 'SOmEVALue';
const mockBuildOlx = jest.fn(() => mockOlx);
jest.mock('../../../containers/ProblemEditor/data/ReactStateOLXParser', () => jest.fn().mockImplementation(() => ({ buildOLX: mockBuildOlx })));

jest.mock('../problem', () => ({
  actions: {
    load: () => {},
    setEnableTypeSelection: () => {},
    updateField: (args) => args,
  },
}));

jest.mock('./requests', () => ({
  fetchAdvancedSettings: (args) => ({ fetchAdvanceSettings: args }),
  saveBlock: (args) => ({ saveBlock: args }),
}));

const blockValue = {
  data: {
    data: checkboxesOLXWithFeedbackAndHintsOLX.rawOLX,
    metadata: {
      markdown: 'SomeMarkdown',
    },
  },
};

let rawOLX = blockValue.data.data;
const rawSettings = {};
const defaultSettings = { max_attempts: 1 };

describe('problem thunkActions', () => {
  let dispatch;
  let getState;
  let dispatchedAction;
  let mockEditorRef;

  const mockProblemState = (isMarkdownEditorEnabled) => ({
    problem: {
      isMarkdownEditorEnabled,
      rawOLX: 'PREVIOUS_OLX',
    },
    app: {
      learningContextId: 'course-v1:org+course+run',
      blockValue,
    },
  });

  const createMockEditorRef = (content = 'MockMarkdownContent') => ({
    current: {
      state: {
        doc: { toString: jest.fn(() => content) },
      },
    },
  });

  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    mockEditorRef = createMockEditorRef();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when markdown editor is enabled', () => {
    beforeEach(() => {
      getState = jest.fn(() => mockProblemState(true));
    });

    test('initializeProblem triggers dispatch', () => {
      initializeProblem(blockValue)(dispatch, getState);
      expect(dispatch).toHaveBeenCalled();
    });

    test('switchToAdvancedEditor converts markdown to OLX', () => {
      switchToAdvancedEditor(mockEditorRef)(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(
        actions.problem.updateField({
          problemType: ProblemTypeKeys.ADVANCED,
          rawOLX: '<problem>\n<p>MockMarkdownContent</p>\n</problem>',
          isMarkdownEditorEnabled: false,
        }),
      );
    });

    test('switchToAdvancedEditor falls back to previous OLX if editorRef missing', () => {
      switchToAdvancedEditor(null)(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(
        actions.problem.updateField({
          problemType: ProblemTypeKeys.ADVANCED,
          rawOLX: 'PREVIOUS_OLX',
          isMarkdownEditorEnabled: false,
        }),
      );
    });
  });

  describe('when markdown editor is disabled', () => {
    beforeEach(() => {
      getState = jest.fn(() => mockProblemState(false));
    });

    test('switchToAdvancedEditor uses ReactStateOLXParser', () => {
      switchToAdvancedEditor(mockEditorRef)(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(
        actions.problem.updateField({
          problemType: ProblemTypeKeys.ADVANCED,
          rawOLX: mockOlx,
          isMarkdownEditorEnabled: false,
        }),
      );
    });
  });

  test('switchToMarkdownEditor dispatches correct actions', () => {
    switchToMarkdownEditor()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      actions.problem.updateField({
        isMarkdownEditorEnabled: true,
      }),
    );
  });

  describe('switchEditor', () => {
    let switchToAdvancedEditorMock;
    let switchToMarkdownEditorMock;

    beforeEach(() => {
      switchToAdvancedEditorMock = jest.fn();
      switchToMarkdownEditorMock = jest.fn();
      // eslint-disable-next-line global-require
      jest.spyOn(require('./problem'), 'switchToAdvancedEditor').mockImplementation(() => switchToAdvancedEditorMock);
      // eslint-disable-next-line global-require
      jest.spyOn(require('./problem'), 'switchToMarkdownEditor').mockImplementation(() => switchToMarkdownEditorMock);
    });

    test('dispatches switchToAdvancedEditor when editorType is advanced', () => {
      switchEditor('advanced', mockEditorRef)(dispatch, getState);
      expect(switchToAdvancedEditorMock).toHaveBeenCalledWith(dispatch, getState);
    });

    test('dispatches switchToMarkdownEditor when editorType is markdown', () => {
      switchEditor('markdown', mockEditorRef)(dispatch, getState);
      expect(switchToMarkdownEditorMock).toHaveBeenCalledWith(dispatch);
    });
  });

  describe('fetchAdvanceSettings', () => {
    it('dispatches fetchAdvanceSettings action', () => {
      fetchAdvancedSettings({ rawOLX, rawSettings, isMarkdownEditorEnabled: true })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      expect(dispatchedAction.fetchAdvanceSettings).not.toEqual(undefined);
    });
    it('dispatches actions.problem.updateField and loadProblem on success', () => {
      dispatch.mockClear();
      fetchAdvancedSettings({ rawOLX, rawSettings, isMarkdownEditorEnabled: true })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onSuccess({ data: { key: 'test', max_attempts: 1 } });
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
    it('calls loadProblem on failure', () => {
      dispatch.mockClear();
      fetchAdvancedSettings({ rawOLX, rawSettings, isMarkdownEditorEnabled: true })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onFailure();
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
  });
  describe('loadProblem', () => {
    test('initializeProblem advanced Problem', () => {
      rawOLX = advancedProblemOlX.rawOLX;
      loadProblem({
        rawOLX, rawSettings, defaultSettings, isMarkdownEditorEnabled: true,
      })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
    test('initializeProblem blank Problem', () => {
      rawOLX = blankProblemOLX.rawOLX;
      loadProblem({
        rawOLX, rawSettings, defaultSettings, isMarkdownEditorEnabled: true,
      })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.setEnableTypeSelection(undefined));
    });
  });
});
