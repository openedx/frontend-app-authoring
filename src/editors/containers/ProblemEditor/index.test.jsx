import React from 'react';
import { shallow } from 'enzyme';

import { thunkActions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { ProblemEditor, mapStateToProps, mapDispatchToProps } from '.';

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
    studioViewFinished: false,
    initializeProblemEditor: jest.fn().mockName('args.intializeProblemEditor'),
    assetsFinished: false,
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<ProblemEditor {...props} />)).toMatchSnapshot();
    });
    test('block loaded, studio view and assets not yet loaded, Spinner appears', () => {
      expect(shallow(<ProblemEditor {...props} blockFinished />)).toMatchSnapshot();
    });
    test('studio view loaded, block and assets not yet loaded, Spinner appears', () => {
      expect(shallow(<ProblemEditor {...props} studioViewFinished />)).toMatchSnapshot();
    });
    test('assets loaded, block and studio view not yet loaded, Spinner appears', () => {
      expect(shallow(<ProblemEditor {...props} assetsFinished />)).toMatchSnapshot();
    });
    test('block failed, message appears', () => {
      expect(shallow(<ProblemEditor
        {...props}
        blockFinished
        studioViewFinished
        assetsFinished
        blockFailed
      />)).toMatchSnapshot();
    });
    test('renders SelectTypeModal', () => {
      expect(shallow(<ProblemEditor {...props} blockFinished studioViewFinished assetsFinished />)).toMatchSnapshot();
    });
    test('renders EditProblemView', () => {
      expect(shallow(<ProblemEditor
        {...props}
        problemType="multiplechoiceresponse"
        blockFinished
        blockFailed
        studioViewFinished
        assetsFinished
      />)).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
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
    test('studioViewFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).studioViewFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchStudioView }));
    });
    test('assetsFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).assetsFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchAssets }));
    });
  });
  describe('mapDispatchToProps', () => {
    test('initializeProblemEditor from thunkActions.problem.initializeProblem', () => {
      expect(mapDispatchToProps.initializeProblemEditor).toEqual(thunkActions.problem.initializeProblem);
    });
  });
});
