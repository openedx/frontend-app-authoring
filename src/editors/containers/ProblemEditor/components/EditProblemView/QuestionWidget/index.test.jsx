/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../data/redux';
import { QuestionWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      updateQuestion: jest.fn().mockName('actions.problem.updateQuestion'),
    },
  },
  selectors: {
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      lmsEndpointUrl: jest.fn(state => ({ lmsEndpointUrl: state })),
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
    },
    problem: {
      question: jest.fn(state => ({ question: state })),
    },
  },
}));

jest.mock('../../../../../sharedComponents/TinyMceWidget/hooks', () => ({
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
  // problemEditorConfig: jest.fn(args => ({ problemEditorConfig: args })),
}));

describe('QuestionWidget', () => {
  const props = {
    question: 'This is my question',
    updateQuestion: jest.fn(),
    // injected
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      expect(shallow(<QuestionWidget {...props} />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('question from problem.question', () => {
      expect(mapStateToProps(testState).question).toEqual(selectors.problem.question(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateQuestion', () => {
      expect(mapDispatchToProps.updateQuestion).toEqual(actions.problem.updateQuestion);
    });
  });
});
