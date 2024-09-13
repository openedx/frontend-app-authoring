import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../testUtils';
import { selectors } from '../../../../../data/redux';
import { QuestionWidgetInternal as QuestionWidget, mapStateToProps } from '.';

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
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
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
    images: {},
    isLibrary: false,
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
    test('images from app.images', () => {
      expect(
        mapStateToProps(testState).images,
      ).toEqual(selectors.app.images(testState));
    });
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
  });
});
