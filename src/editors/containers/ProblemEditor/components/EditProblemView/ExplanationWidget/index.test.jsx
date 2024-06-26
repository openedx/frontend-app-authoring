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
}));

describe('SolutionWidget', () => {
  const props = {
    settings: { solutionExplanation: 'This is my question' },
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
    test('question from problem.question', () => {
      expect(mapStateToProps(testState).settings).toEqual(selectors.problem.settings(testState));
    });
  });
});
