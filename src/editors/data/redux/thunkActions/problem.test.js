import { actions } from '..';
import * as module from './problem';
import { checkboxesOLXWithFeedbackAndHintsOLX, advancedProblemOlX, blankProblemOLX } from '../../../containers/ProblemEditor/data/mockData/olxTestData';
import { ProblemTypeKeys } from '../../constants/problem';

const mockOlx = 'SOmEVALue';
const mockBuildOlx = jest.fn(() => mockOlx);
jest.mock('../../../containers/ProblemEditor/data/ReactStateOLXParser', () => jest.fn().mockImplementation(() => ({ buildOLX: mockBuildOlx })));

jest.mock('..', () => ({
  actions: {
    problem: {
      load: () => {},
      setEnableTypeSelection: () => {},
      updateField: (args) => args,
    },
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
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('initializeProblem visual Problem :', () => {
    module.initializeProblem(blockValue)(dispatch);
    expect(dispatch).toHaveBeenCalled();
  });
  test('switchToAdvancedEditor visual Problem', () => {
    module.switchToAdvancedEditor()(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(
      actions.problem.updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX: mockOlx }),
    );
  });
  describe('fetchAdvanceSettings', () => {
    it('dispatches fetchAdvanceSettings action', () => {
      module.fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      expect(dispatchedAction.fetchAdvanceSettings).not.toEqual(undefined);
    });
    it('dispatches actions.problem.updateField and loadProblem on success', () => {
      dispatch.mockClear();
      module.fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onSuccess({ data: { key: 'test', max_attempts: 1 } });
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load());
    });
    it('calls loadProblem on failure', () => {
      dispatch.mockClear();
      module.fetchAdvancedSettings({ rawOLX, rawSettings })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
      dispatchedAction.fetchAdvanceSettings.onFailure();
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load());
    });
  });
  describe('loadProblem', () => {
    test('initializeProblem advanced Problem', () => {
      rawOLX = advancedProblemOlX.rawOLX;
      module.loadProblem({ rawOLX, rawSettings, defaultSettings })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.load());
    });
    test('initializeProblem blank Problem', () => {
      rawOLX = blankProblemOLX.rawOLX;
      module.loadProblem({ rawOLX, rawSettings, defaultSettings })(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.problem.setEnableTypeSelection());
    });
  });
});
