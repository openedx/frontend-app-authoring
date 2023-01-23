import { actions } from '..';
import { initializeProblem, switchToAdvancedEditor } from './problem';
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

describe('problem thunkActions', () => {
  let dispatch;
  let getState;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
    getState = jest.fn(() => ({
      problem: {
      },
    }));
  });
  test('initializeProblem visual Problem :', () => {
    const blockValue = { data: { data: checkboxesOLXWithFeedbackAndHintsOLX.rawOLX } };
    initializeProblem(blockValue)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.problem.load());
  });
  test('initializeProblem advanced Problem', () => {
    const blockValue = { data: { data: advancedProblemOlX.rawOLX } };
    initializeProblem(blockValue)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.problem.load());
  });
  test('initializeProblem blank Problem', () => {
    const blockValue = { data: { data: blankProblemOLX.rawOLX } };
    initializeProblem(blockValue)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(actions.problem.setEnableTypeSelection());
  });
  test('switchToAdvancedEditor visual Problem', () => {
    switchToAdvancedEditor()(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(
      actions.problem.updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOlx: mockOlx }),
    );
  });
});
