import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../testUtils';
import { selectors } from '../../../../../data/redux';
import { ExplanationWidgetInternal as ExplanationWidget, mapStateToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  selectors: {
    problem: {
      settings: jest.fn(state => ({ question: state })),
    },
    app: {
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
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

describe('SolutionWidget', () => {
  const props = {
    settings: { solutionExplanation: 'This is my solution' },
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
    // injected
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      expect(shallow(<ExplanationWidget {...props} />).snapshot).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('settings from problem.settings', () => {
      expect(mapStateToProps(testState).settings).toEqual(selectors.problem.settings(testState));
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
