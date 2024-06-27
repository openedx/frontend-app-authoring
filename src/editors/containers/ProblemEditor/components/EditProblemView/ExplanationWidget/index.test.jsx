/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { selectors } from '../../../../../data/redux';
import { ExplanationWidget, mapStateToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  selectors: {
    problem: {
      settings: jest.fn(state => ({ question: state })),
    },
    app: {
      learningContextId: jest.fn(state => ({ learningContextId: state })),
    },
  },
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

jest.mock('../../../../../sharedComponents/TinyMceWidget/hooks', () => ({
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
  replaceStaticWithAsset: jest.fn(() => 'This is my solution'),
}));

describe('SolutionWidget', () => {
  const props = {
    settings: { solutionExplanation: 'This is my solution' },
    learningContextId: 'course+org+run',
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
  });
});
