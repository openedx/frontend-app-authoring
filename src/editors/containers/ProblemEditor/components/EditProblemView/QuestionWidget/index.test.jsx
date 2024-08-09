import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { selectors } from '../../../../../data/redux';
import { QuestionWidget, mapStateToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  actions: {
    problem: {
      updateQuestion: jest.fn().mockName('actions.problem.updateQuestion'),
    },
  },
  selectors: {
    app: {
      learningContextId: jest.fn(state => ({ learningContextId: state })),
    },
    problem: {
      question: jest.fn(state => ({ question: state })),
    },
  },
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

jest.mock('../../../../../sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('../../../../../sharedComponents/TinyMceWidget/hooks'),
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

describe('QuestionWidget', () => {
  const props = {
    question: 'This is my question',
    updateQuestion: jest.fn(),
    learningContextId: 'course+org+run',
    // injected
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      expect(shallow(<QuestionWidget {...props} />).snapshot).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('question from problem.question', () => {
      expect(mapStateToProps(testState).question).toEqual(selectors.problem.question(testState));
    });
    test('learningContextId from app.learningContextId', () => {
      expect(mapStateToProps(testState).learningContextId).toEqual(selectors.app.learningContextId(testState));
    });
  });
});
