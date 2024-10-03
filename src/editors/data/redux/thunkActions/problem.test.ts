import 'CourseAuthoring/editors/setupEditorTest';
import { actions } from '..';
import {
  initializeProblem,
  switchToAdvancedEditor,
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
}));

const blockValue = {
  data: {
    data: checkboxesOLXWithFeedbackAndHintsOLX.rawOLX,
    metadata: {},
  },
};

let rawOLX = blockValue.data.data;
const rawSettings = {};
const defaultSettings = { max_attempts: 1 };

describe('problem thunkActions', () => {
  let dispatch;
  let getState;
  let dispatchedAction;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    getState = jest.fn(() => ({
      problem: {
      },
      app: {
        learningContextId: 'course-v1:org+course+run',
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('initializeProblem visual Problem :', () => {
    initializeProblem(blockValue)(dispatch, getState);
    expect(dispatch).toHaveBeenCalled();
  });
  test('switchToAdvancedEditor visual Problem', () => {
    switchToAdvancedEditor()(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(
      actions.problem.updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX: mockOlx }),
    );
  });
  describe('fetchAdvanceSettings', () => {
    it('dispatches fetchAdvanceSettings action', () => {
      fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      expect(dispatchedAction.fetchAdvanceSettings).not.toEqual(undefined);
    });
    it('dispatches actions.problem.updateField and loadProblem on success', () => {
      dispatch.mockClear();
      fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onSuccess({ data: { key: 'test', max_attempts: 1 } });
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
    it('calls loadProblem on failure', () => {
      dispatch.mockClear();
      fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onFailure();
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
  });
  describe('loadProblem', () => {
    test('initializeProblem advanced Problem', () => {
      rawOLX = advancedProblemOlX.rawOLX;
      loadProblem({ rawOLX, rawSettings, defaultSettings })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load(undefined));
    });
    test('initializeProblem blank Problem', () => {
      rawOLX = blankProblemOLX.rawOLX;
      loadProblem({ rawOLX, rawSettings, defaultSettings })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.setEnableTypeSelection(undefined));
    });
  });
});
