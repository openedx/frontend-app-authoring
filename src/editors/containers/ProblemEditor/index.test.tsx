import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { Spinner } from '@openedx/paragon';
import { thunkActions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { ProblemEditorInternal as ProblemEditor, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('./components/EditProblemView', () => 'EditProblemView');
jest.mock('./components/SelectTypeModal', () => 'SelectTypeModal');

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useState: jest.fn(val => ([{ state: val }, jest.fn().mockName('setState')])),
  };
});

jest.mock('../../data/redux', () => ({
  thunkActions: {
    problem: {
      initializeProblemEditor: jest.fn().mockName('thunkActions.problem.initializeProblem'),
    },
  },
  selectors: {
    app: {
      blockValue: jest.fn(state => ({ blockValue: state })),
    },
    problem: {
      problemType: jest.fn(state => ({ problemType: state })),
    },
    requests: {
      isFinished: jest.fn((state, params) => ({ isFinished: { state, params } })),
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

describe('ProblemEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    // redux
    problemType: null,
    blockValue: { data: { data: 'eDiTablE Text' } },
    blockFinished: false,
    blockFailed: false,
    initializeProblemEditor: jest.fn().mockName('args.intializeProblemEditor'),
    advancedSettingsFinished: false,
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<ProblemEditor {...props} />).snapshot).toMatchSnapshot();
    });
    test('block loaded, studio view and assets not yet loaded, Spinner appears', () => {
      const wrapper = shallow(<ProblemEditor {...props} blockFinished />);
      expect(wrapper.instance.findByType(Spinner)).toBeTruthy();
    });
    test('advanceSettings loaded, block and studio view not yet loaded, Spinner appears', () => {
      const wrapper = shallow(<ProblemEditor {...props} advancedSettingsFinished />);
      expect(wrapper.instance.findByType(Spinner)).toBeTruthy();
    });
    test('block failed, message appears', () => {
      const wrapper = shallow(<ProblemEditor
        {...props}
        blockFinished
        advancedSettingsFinished
        blockFailed
      />);
      expect(wrapper.snapshot).toMatchSnapshot();
    });
    test('renders SelectTypeModal', () => {
      const wrapper = shallow(<ProblemEditor
        {...props}
        blockFinished
        advancedSettingsFinished
      />);
      expect(wrapper.instance.findByType('SelectTypeModal')).toHaveLength(1);
    });
    test('renders EditProblemView', () => {
      const wrapper = shallow(<ProblemEditor
        {...props}
        problemType="multiplechoiceresponse"
        blockFinished
        advancedSettingsFinished
      />);
      expect(wrapper.instance.findByType('EditProblemView')).toHaveLength(1);
    });
  });

  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' } as any;
    test('blockValue from app.blockValue', () => {
      expect(
        mapStateToProps(testState).blockValue,
      ).toEqual(selectors.app.blockValue(testState));
    });
    test('problemType from problem.problemType', () => {
      expect(
        mapStateToProps(testState).problemType,
      ).toEqual(selectors.problem.problemType(testState));
    });
    test('blockFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).blockFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchBlock }));
    });
    test('advancedSettingsFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).advancedSettingsFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchAdvancedSettings }));
    });
  });
  describe('mapDispatchToProps', () => {
    test('initializeProblemEditor from thunkActions.problem.initializeProblem', () => {
      expect(mapDispatchToProps.initializeProblemEditor).toEqual(thunkActions.problem.initializeProblem);
    });
  });
});
